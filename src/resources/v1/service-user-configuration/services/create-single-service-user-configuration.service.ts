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
import { serviceUserConfigResponse } from "../service-user-configuration.response";
import { ICreateSingleServiceUserConfigPayload } from "../payloads/service-user-configuration.payload";
import createServiceUserConfigurationHelperService from "../helpers/operations/create-service-user-configuration.helper.service";
import findServiceUserConfigurationHelperService from "../helpers/validators/find-service-user-configuration.helper.service";
import findUserHelperService from "@/resources/v1/users/helpers/validators/find-user.helper.service";
import findServiceHelperService from "@/resources/v1/masters/services/helpers/validators/find-service.helper.service";
import { usersErrorsMessages } from "@/resources/v1/users/users.messages";
import { roleTypes } from "@/utils/definitions/constants/role-types";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import processDocumentEligibilityHelperService from "@/resources/v1/service-user-document-configuration/helpers/operations/process-document-eligibility.helper.service";
import { serviceUserDocConfigErrorsMessages } from "@/resources/v1/service-user-document-configuration/service-user-document-configuration.messages";

class CreateSingleServiceUserConfigurationService {
  public async execute(
    userId: string,
    request: Request,
    payload?: ICreateSingleServiceUserConfigPayload,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    const body =
      payload ?? (request.body as ICreateSingleServiceUserConfigPayload);

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

      // 1. Verify user exists
      await findUserHelperService.execute(
        { _id: new mongoose.Types.ObjectId(targetUserId) } as any,
        usersErrorsMessages,
        { throwIfNotFound: true, returnDocument: false, session },
      );

      // 2. Verify service exists
      const service = await findServiceHelperService.findOne(
        { _id: new mongoose.Types.ObjectId(body.service_id), is_deleted: false },
        session,
      );

      if (!service) {
        throwError(
          "service_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Service not found",
            data: { service_id: body.service_id },
          }),
        );
      }

      // 3. Check if mapping already exists
      const existing = await findServiceUserConfigurationHelperService.findOne(
        {
          user_id: new mongoose.Types.ObjectId(targetUserId),
          task_id: new mongoose.Types.ObjectId(body.service_id),
          is_deleted: false,
        },
        session,
      );

      if (existing) {
        throwError(
          "already_exists",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service user configuration already exists for this task",
            data: { service_id: body.service_id, user_id: targetUserId },
          }),
        );
      }

      const currentUserId = userId
        ? new mongoose.Types.ObjectId(userId)
        : undefined;

      const targetUserObjectId = new mongoose.Types.ObjectId(targetUserId);
      const serviceObjectId = new mongoose.Types.ObjectId(body.service_id);

      // 4. Evaluate document eligibility from service_document_configurations
      const eligibilityMap =
        await processDocumentEligibilityHelperService.evaluateServicesEligibility(
          [serviceObjectId],
          session,
        );

      const evaluation = eligibilityMap.get(serviceObjectId.toString()) ?? {
        serviceId: serviceObjectId,
        eligibilityStatus: "success" as const,
        requiredDocuments: [],
      };

      const finalEligibilityStatus =
        body.eligibility_status ?? evaluation.eligibilityStatus;

      const record =
        await createServiceUserConfigurationHelperService.createSingle(
          targetUserObjectId,
          serviceObjectId,
          finalEligibilityStatus,
          currentUserId,
          session,
          DbTransactions,
          serviceUserConfigErrorsMessages,
        );

      // 5. Create user document configuration records for required documents
      if (evaluation.requiredDocuments.length > 0) {
        await processDocumentEligibilityHelperService.processAndPersistUserDocumentConfigurations(
          targetUserObjectId,
          [evaluation],
          currentUserId,
          session,
          DbTransactions,
          serviceUserDocConfigErrorsMessages,
        );
      }

      await record.populate(populateFields);

      await session.commitTransaction();

      return serviceUserConfigPayload(
        "service_user_config_created",
        serviceUserConfigResponse(record),
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

export default new CreateSingleServiceUserConfigurationService();
