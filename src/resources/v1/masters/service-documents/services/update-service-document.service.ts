import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { Request } from "express";
import findServiceDocumentHelperService from "../helpers/validators/find-service-document.helper.service";
import { populateFields, serviceDocumentPayload, throwError } from "../service-documents.helper";
import { serviceDocumentErrorsMessages } from "../service-documents.messages";
import updateServiceDocumentHelperService from "../helpers/operations/update-service-document.helper.service";
import { IUpdateServiceDocumentPayloadStrict } from "../payloads/service-document-payload";
import { serviceDocumentResponse } from "../service-documents.response";
import DocumentModel from "@/database/documents/documents-db-model";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class updateServiceDocumentService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: IUpdateServiceDocumentPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await findServiceDocumentHelperService.execute(
        { _id: id } as any,
        serviceDocumentErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const body = payload ?? (request.body as IUpdateServiceDocumentPayloadStrict);

      // Check duplicates for name or item_code (excluding self)
      const queryOr: any[] = [];
      if (body.name && body.name !== existing[0].name) queryOr.push({ name: body.name });
      if (body.item_code && body.item_code !== existing[0].item_code) queryOr.push({ item_code: body.item_code });

      if (queryOr.length > 0) {
        await findServiceDocumentHelperService.execute(
          {
            $or: queryOr,
            _id: { $ne: id },
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
      }

      // Validate sample documents if updated
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

      const userId = request.user?.id ? new mongoose.Types.ObjectId(request.user.id) : undefined;

      const updated = await updateServiceDocumentHelperService.execute(
        id,
        body,
        existing[0],
        session,
        DbTransactions,
        serviceDocumentErrorsMessages,
        userId,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return serviceDocumentPayload(
        "service_document_updated",
        serviceDocumentResponse(updated),
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

export default new updateServiceDocumentService();
