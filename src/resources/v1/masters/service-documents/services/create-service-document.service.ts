import { SingleResponse } from "@/utils/responses/success.response";
import { IInputServiceDocumentPayloadStrict } from "../payloads/service-document-payload";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toServiceDocumentDTO } from "../dto/service-document.dto";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { serviceDocumentErrorsMessages } from "../service-documents.messages";
import findServiceDocumentHelperService from "../helpers/validators/find-service-document.helper.service";
import { populateFields, serviceDocumentPayload, throwError } from "../service-documents.helper";
import createServiceDocumentHelperService from "../helpers/operations/create-service-document.helper.service";
import { serviceDocumentResponse } from "../service-documents.response";
import DocumentModel from "@/database/documents/documents-db-model";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { documentTypesErrorsMessages } from "../../document-types/document-types.messages";
import findDocumentTypesHelperService from "../../document-types/helpers/validators/find-document-types.helper.service";

class createServiceDocumentService {
  public async execute(
    request: Request,
    payload?: IInputServiceDocumentPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toServiceDocumentDTO);

    try {
      session.startTransaction();

      // Check duplicate name or item_code
      await findServiceDocumentHelperService.execute(
        {
          $or: [
            { name: body.name },
            { item_code: body.item_code },
          ],
          is_deleted: false,
        } as any,
        serviceDocumentErrorsMessages,
        {
          throwIfExists: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      // Validate sample documents if provided
      if (body.samples && body.samples.length > 0) {
        for (const sampleId of body.samples) {
          const sampleDoc = await DocumentModel.findOne({
            _id: sampleId,
            is_active: true,
            is_deleted: false,
          }).session(session);

          if (!sampleDoc) {
            throwError(
              "document_not_found",
              ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
                message: `Sample document not found: ${sampleId}`,
                data: { sampleId },
                filler: { 0: sampleId.toString() },
              }),
            );
          }
        }
      }
      const documentTypes = await findDocumentTypesHelperService.execute(
        {
          _id: body.document_type_id,
          is_deleted: false,
          is_active: { $in: [true, false] },
        },
        documentTypesErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: false,
          session,
        },
      );
      const userId = request.user?.id ? new mongoose.Types.ObjectId(request.user.id) : undefined;
      const newDoc = await createServiceDocumentHelperService.execute(
        {
          ...body,
          created_by: userId,
        },
        session,
        DbTransactions,
        serviceDocumentErrorsMessages,
      );

      await newDoc.populate(populateFields);

      await session.commitTransaction();
      return serviceDocumentPayload(
        "service_document_created",
        serviceDocumentResponse(newDoc),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceDocumentErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new createServiceDocumentService();
