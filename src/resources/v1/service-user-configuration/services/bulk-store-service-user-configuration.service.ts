import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  serviceUserConfigPayload,
  throwError,
  populateFields,
} from "../service-user-configuration.helper";
import { serviceUserConfigErrorsMessages } from "../service-user-configuration.messages";
import { serviceUserConfigListResponse } from "../service-user-configuration.response";
import { IBulkStoreServiceUserConfigPayload } from "../payloads/service-user-configuration.payload";
import createServiceUserConfigurationHelperService from "../helpers/operations/create-service-user-configuration.helper.service";
import findUserHelperService from "@/resources/v1/users/helpers/validators/find-user.helper.service";
import findServiceHelperService from "@/resources/v1/masters/services/helpers/validators/find-service.helper.service";
import { usersErrorsMessages } from "@/resources/v1/users/users.messages";
import { roleTypes } from "@/utils/definitions/constants/role-types";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { BaseServiceModel } from "@/database/services/services-db-model";
import processDocumentEligibilityHelperService from "@/resources/v1/service-user-document-configuration/helpers/operations/process-document-eligibility.helper.service";
import { serviceUserDocConfigErrorsMessages } from "@/resources/v1/service-user-document-configuration/service-user-document-configuration.messages";

class BulkStoreServiceUserConfigurationService {
  public async execute(
    userId: string,
    request: Request,
    payload?: IBulkStoreServiceUserConfigPayload,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    const body = payload ?? (request.body as IBulkStoreServiceUserConfigPayload);

    try {
      session.startTransaction();

      let targetUserId = userId;
      if (body.user_id) {
        const roleObj = (request.user as any)?.role;
        const currentUserRoleLabel =
          roleObj && typeof roleObj === "object" ? roleObj.label : roleObj;
        const isAdminOrSuperAdmin =
          currentUserRoleLabel === roleTypes.Admin ||
          currentUserRoleLabel === roleTypes.SuperAdmin;

        if (!isAdminOrSuperAdmin) {
          const response = ResponseBuilder.error(ErrorTypes.UNAUTHORIZED, {
            message: "Forbidden: Only admins can specify a target user ID",
            data: {},
          });
          throwError("forbidden", response);
        }
        targetUserId = body.user_id;
      }

      // Check unique services in payload
      const serviceIdStrings = body.service_ids;
      const uniqueServiceIds = Array.from(new Set(serviceIdStrings));
      if (serviceIdStrings.length !== uniqueServiceIds.length) {
        const duplicates = serviceIdStrings.filter(
          (item, index) => serviceIdStrings.indexOf(item) !== index,
        );
        throwError(
          "duplicate_services_in_payload",
          ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
            message: "Duplicate service IDs found in the payload",
            data: { duplicate_service_ids: Array.from(new Set(duplicates)) },
          }),
        );
      }

      // 1. Verify user exists
      await findUserHelperService.execute(
        { _id: new mongoose.Types.ObjectId(targetUserId) } as any,
        usersErrorsMessages,
        { throwIfNotFound: true, returnDocument: false, session },
      );

      // 2. Verify all services exist and are active
      const serviceObjectIds = uniqueServiceIds.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
      const foundServices = await BaseServiceModel.find({
        _id: { $in: serviceObjectIds },
        is_deleted: false,
        is_active: true,
      })
        .session(session)
        .lean();

      if (foundServices.length !== uniqueServiceIds.length) {
        const foundIdStrs = foundServices.map((s) => s._id.toString());
        const missingIds = uniqueServiceIds.filter(
          (id) => !foundIdStrs.includes(id),
        );
        throwError(
          "services_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Some services were not found or are inactive",
            data: { missing_service_ids: missingIds },
          }),
        );
      }

      const currentUserId = userId
        ? new mongoose.Types.ObjectId(userId)
        : undefined;

      // 3. Evaluate Document Eligibility from service_document_configurations
      const targetUserObjectId = new mongoose.Types.ObjectId(targetUserId);
      const eligibilityMap =
        await processDocumentEligibilityHelperService.evaluateServicesEligibility(
          serviceObjectIds,
          session,
        );

      const serviceEligibilityStatusMap = new Map<string, "pending" | "success">();
      const evaluationList = [];
      for (const [sId, evalResult] of eligibilityMap.entries()) {
        serviceEligibilityStatusMap.set(sId, evalResult.eligibilityStatus);
        evaluationList.push(evalResult);
      }

      // 4. Bulk upsert configuration with dynamic eligibility
      const records =
        await createServiceUserConfigurationHelperService.bulkUpsert(
          targetUserObjectId,
          serviceObjectIds,
          currentUserId,
          session,
          DbTransactions,
          serviceUserConfigErrorsMessages,
          serviceEligibilityStatusMap,
        );

      // 5. Create user document configuration records for required documents
      await processDocumentEligibilityHelperService.processAndPersistUserDocumentConfigurations(
        targetUserObjectId,
        evaluationList,
        currentUserId,
        session,
        DbTransactions,
        serviceUserDocConfigErrorsMessages,
      );

      for (const rec of records) {
        await rec.populate(populateFields);
      }

      await session.commitTransaction();

      return serviceUserConfigPayload(
        "service_user_configs_bulk_created",
        serviceUserConfigListResponse(records),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(
        err.message,
        serviceUserConfigErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new BulkStoreServiceUserConfigurationService();
