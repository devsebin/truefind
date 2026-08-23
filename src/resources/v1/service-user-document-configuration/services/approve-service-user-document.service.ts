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
import { IApproveServiceUserDocPayload } from "../payloads/service-user-document-configuration.payload";
import findServiceUserDocumentConfigurationHelperService from "../helpers/validators/find-service-user-document-configuration.helper.service";
import approveServiceUserDocumentHelperService from "../helpers/operations/approve-service-user-document.helper.service";
import serviceDocumentRequirementModel from "@/database/service-documents/service-documents-db-model";
import TaskUserMappingModel from "@/database/service-user-configuration/service-user-configuration-db-model";
import ServiceUserDocumentConfigurationsModel, {
  ServiceUserDocumentConfigurationStatus,
} from "@/database/service-user-document-configuration/service-user-document-configuration-db-model";
import { roleTypes } from "@/utils/definitions/constants/role-types";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";

class ApproveServiceUserDocumentService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: IApproveServiceUserDocPayload,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    const body = payload ?? (request.body as IApproveServiceUserDocPayload);

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
          message: "Forbidden: You are not authorized to approve documents",
          data: {},
        });
        throwError("unauthorized", response);
      }

      // 2. Load service user document configuration
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

      if (!Array.isArray(config.uploads) || config.uploads.length === 0) {
        throwError(
          "no_upload_found",
          ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
            message: "No upload record found to approve for this configuration",
            data: { id },
          }),
        );
      }

      // 3. Load associated service document requirement & inspect data_requirements
      const serviceDocRequirement =
        await serviceDocumentRequirementModel.findOne({
          _id: config.document_requirement_id,
          is_deleted: false,
        }).session(session);

      if (!serviceDocRequirement) {
        throwError(
          "document_requirement_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Associated service document requirement not found",
            data: { document_requirement_id: config.document_requirement_id },
            filler: { 0: config.document_requirement_id },
          }),
        );
      }

      const dataRequirements = serviceDocRequirement.data_requirements || [];

      // 4. Validate all data_requirements evaluate to true
      // If validation_rules are specified, verify they are satisfied
      const unsatisfiedRequirements: any[] = [];

      for (const req of dataRequirements) {
        if (req.validation_rules?.required && !req.expected_value && !req.field_name) {
          unsatisfiedRequirements.push(req);
        }
      }

      if (unsatisfiedRequirements.length > 0) {
        throwError(
          "approval_requirements_failed",
          ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
            message:
              "Document cannot be approved: all data requirements must be satisfied",
            data: { unsatisfied_requirements: unsatisfiedRequirements },
          }),
        );
      }

      const employeeId = request.user?._id
        ? new mongoose.Types.ObjectId(request.user._id.toString())
        : undefined;

      // 5. Update upload status and configuration status to approved
      const updated = await approveServiceUserDocumentHelperService.execute(
        config,
        employeeId,
        body?.validation_notes,
        session,
        DbTransactions,
        serviceUserDocConfigErrorsMessages,
      );

      // 6. Check if all mandatory documents for this user & service are approved
      const allUserDocsForService =
        await ServiceUserDocumentConfigurationsModel.find({
          user_id: config.user_id,
          task_id: config.task_id,
          is_deleted: false,
        }).session(session);

      const allMandatoryApproved = allUserDocsForService
        .filter((d) => d.is_mandatory)
        .every(
          (d) =>
            (d._id.toString() === config._id.toString()
              ? ServiceUserDocumentConfigurationStatus.APPROVED
              : d.current_status) ===
            ServiceUserDocumentConfigurationStatus.APPROVED,
        );

      if (allMandatoryApproved) {
        const userTaskMapping = await TaskUserMappingModel.findOne({
          user_id: config.user_id,
          task_id: config.task_id,
          is_deleted: false,
        }).session(session);

        if (userTaskMapping && userTaskMapping.eligibility_status !== "success") {
          userTaskMapping.eligibility_status = "success";
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
        "service_user_doc_approved",
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

export default new ApproveServiceUserDocumentService();
