import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  serviceUserDocConfigPayload,
  throwError,
  populateFields,
} from "../service-user-document-configuration.helper";
import { serviceUserDocConfigErrorsMessages } from "../service-user-document-configuration.messages";
import { serviceUserDocConfigResponse } from "../service-user-document-configuration.response";
import { IRejectServiceUserDocPayload } from "../payloads/service-user-document-configuration.payload";
import findServiceUserDocumentConfigurationHelperService from "../helpers/validators/find-service-user-document-configuration.helper.service";
import rejectServiceUserDocumentHelperService from "../helpers/operations/reject-service-user-document.helper.service";
import TaskUserMappingModel from "@/database/service-user-configuration/service-user-configuration-db-model";
import { roleTypes } from "@/utils/definitions/constants/role-types";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";

class RejectServiceUserDocumentService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: IRejectServiceUserDocPayload,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    const body = payload ?? (request.body as IRejectServiceUserDocPayload);

    try {
      session.startTransaction();

      // 1. Verify authorization (Employee / Admin)
      const roleObj = (request.user as any)?.role;
      const roleIdStr =
        roleObj && typeof roleObj === "object"
          ? (roleObj._id ? roleObj._id.toString() : (roleObj.label || roleObj.name))
          : String(roleObj || "");

      const hasReviewRole =
        roleIdStr === roleTypes.Employee ||
        roleIdStr === roleTypes.Admin ||
        roleIdStr === roleTypes.SuperAdmin ||
        roleIdStr === "employee" ||
        roleIdStr === "admin" ||
        roleIdStr === "super_admin" ||
        roleIdStr === "64b8a1c8f1e67290bc5b4d1c" || // employee
        roleIdStr === "64b8a1c8f1e67290bc5b4d1b" || // admin
        roleIdStr === "64b8a1c8f1e67290bc5b4d1a";   // super_admin

      if (!hasReviewRole) {
        const response = ResponseBuilder.error(ErrorTypes.UNAUTHORIZED, {
          message: "Forbidden: You are not authorized to reject documents",
          data: {},
        });
        throwError("unauthorized", response);
      }

      // 2. Validate reason is provided and non-empty
      if (!body?.reason || typeof body.reason !== "string" || body.reason.trim() === "") {
        const response = ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
          message: "Rejection reason is mandatory",
          data: { reason: body?.reason },
        });
        throwError("rejection_reason_required", response);
      }

      // 3. Load service user document configuration
      const configs =
        await findServiceUserDocumentConfigurationHelperService.execute(
          { _id: id, is_deleted: false } as any,
          serviceUserDocConfigErrorsMessages,
          {
            throwIfNotFound: true,
            returnDocument: true,
            session,
          },
        );

      const config = configs[0];

      const employeeId = request.user?._id
        ? new mongoose.Types.ObjectId(request.user._id.toString())
        : undefined;

      // 4. Update upload status and configuration status to rejected, preserving existing fields
      const updated = await rejectServiceUserDocumentHelperService.execute(
        config,
        body.reason.trim(),
        employeeId,
        session,
        DbTransactions,
        serviceUserDocConfigErrorsMessages,
      );

      // 5. Ensure service level status is marked pending/rejected if a mandatory doc is rejected
      if (config.is_mandatory) {
        const userTaskMapping = await TaskUserMappingModel.findOne({
          user_id: config.user_id,
          task_id: config.task_id,
          is_deleted: false,
        }).session(session);

        if (userTaskMapping && userTaskMapping.eligibility_status === "success") {
          userTaskMapping.eligibility_status = "pending";
          if (employeeId) {
            userTaskMapping.updated_by = employeeId;
          }
          await userTaskMapping.save({ session });

          DbTransactions.push(
            await createDbTransaction(
              tableName.ServiceUserConfigurations,
              apiMethods.PATCH,
              operationTypes.Update,
              userTaskMapping,
            ),
          );
        }
      }

      await updated.populate(populateFields);

      await session.commitTransaction();

      return serviceUserDocConfigPayload(
        "service_user_doc_rejected",
        serviceUserDocConfigResponse(updated),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(
        err.message,
        serviceUserDocConfigErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new RejectServiceUserDocumentService();
