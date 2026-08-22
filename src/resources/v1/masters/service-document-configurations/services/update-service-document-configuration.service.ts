import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  returnServiceDocumentConfigSuccess,
  throwServiceDocumentConfigError,
  populateFields,
} from "../service-document-configurations.helper";
import { serviceDocumentConfigErrorsMessages } from "../service-document-configurations.messages";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toUpdateServiceDocumentConfigurationDTO } from "../dto/service-document-configuration.dto";
import { serviceDocumentConfigResponse } from "../service-document-configurations.response";
import findServiceDocumentConfigurationHelperService from "../helpers/validators/find-service-document-configuration.helper.service";
import updateServiceDocumentConfigurationHelperService from "../helpers/operations/update-service-document-configuration.helper.service";
import serviceDocumentRequirementModel from "@/database/service-documents/service-documents-db-model";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import { getContextUserId } from "@/utils/context/request-context";
import ServiceDocumentConfigurationModel from "@/database/service-document-configuration/service-document-configuration-db-model";

class UpdateServiceDocumentConfigurationService {
  public async execute(
    idOrServiceId: mongoose.Types.ObjectId,
    request: Request,
    payload?: any,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(
      request,
      payload,
      toUpdateServiceDocumentConfigurationDTO,
    );

    try {
      session.startTransaction();

      // 1. Find existing config
      const existing = await ServiceDocumentConfigurationModel.findOne({
        $or: [{ _id: idOrServiceId }, { service_id: idOrServiceId }],
        is_deleted: false,
      }).session(session);

      if (!existing) {
        throwServiceDocumentConfigError(
          "config_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Service document configuration not found",
            data: { id: idOrServiceId.toString() },
          }),
        );
      }

      // 2. Validate duplicate documents in payload
      const docIds = body.required_documents.map((d) => d.document_id.toString());
      const uniqueDocIds = Array.from(new Set(docIds));
      if (docIds.length !== uniqueDocIds.length) {
        throwServiceDocumentConfigError(
          "duplicate_documents_in_payload",
          ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
            message: "Duplicate document_id entries are not allowed in required_documents",
            data: { required_documents: body.required_documents },
          }),
        );
      }

      // 3. Check for self-exemption and gather all document IDs to validate existence
      const allDocIdsToValidate = new Set<string>(uniqueDocIds);

      for (const reqDoc of body.required_documents) {
        const reqDocIdStr = reqDoc.document_id.toString();
        for (const exDoc of reqDoc.exemption_documents || []) {
          const exDocIdStr = exDoc.document_id.toString();
          if (reqDocIdStr === exDocIdStr) {
            throwServiceDocumentConfigError(
              "self_exemption_not_allowed",
              ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
                message: "A required document cannot exempt itself",
                data: { document_id: reqDocIdStr },
              }),
            );
          }
          allDocIdsToValidate.add(exDocIdStr);
        }
      }

      // 4. Validate existence of all referenced service documents
      const foundDocs = await serviceDocumentRequirementModel
        .find({
          _id: { $in: Array.from(allDocIdsToValidate) },
          is_deleted: false,
          is_active: true,
        })
        .session(session);

      if (foundDocs.length !== allDocIdsToValidate.size) {
        const foundIdStrs = foundDocs.map((d) => d._id.toString());
        const missingIds = Array.from(allDocIdsToValidate).filter(
          (id) => !foundIdStrs.includes(id),
        );
        throwServiceDocumentConfigError(
          "document_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "One or more service documents were not found or are inactive",
            data: { missing_document_ids: missingIds },
          }),
        );
      }

      const userIdStr = getContextUserId();
      const userId = userIdStr
        ? new mongoose.Types.ObjectId(userIdStr)
        : request.user?.id
        ? new mongoose.Types.ObjectId(request.user.id)
        : undefined;

      const updated = await updateServiceDocumentConfigurationHelperService.execute(
        existing._id as mongoose.Types.ObjectId,
        { required_documents: body.required_documents },
        existing,
        userId,
        session,
        dbTransactions,
        serviceDocumentConfigErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return returnServiceDocumentConfigSuccess(
        "config_updated",
        serviceDocumentConfigResponse(updated),
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceDocumentConfigErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new UpdateServiceDocumentConfigurationService();
