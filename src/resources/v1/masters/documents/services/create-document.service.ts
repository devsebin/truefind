import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { DocumentErrorMessages } from "../documents.messages";
import { FilesSuccessPayload, populateFields, throwError } from "../documents.helper";
import createDocumentHelperService from "../helpers/operations/create-document.helper.service";
import IDocument from "@/database/documents/documents-db-interface";
import { deleteS3Objects } from "@/services/aws/s3-helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class createDocumentService {
  public async execute(
    object: IDocument,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const originalUrl = object.keys.original;
    const thumbnailUrls = object.keys.thumbnails ?? [];
    const allKeys = [originalUrl, ...thumbnailUrls];

    try {
      session.startTransaction();

      const newDoc = await createDocumentHelperService.execute(
        object,
        session,
        DbTransactions,
        DocumentErrorMessages,
      );

      if (!newDoc) {
        await session.abortTransaction();
        session.endSession();
        await deleteS3Objects(allKeys);
        const response = ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
          message: "File upload failed",
          data: { document: object },
        });
        throwError("file_upload_failed", response);
      }

      await newDoc.populate(populateFields);

      await session.commitTransaction();
      session.endSession();

      return FilesSuccessPayload("file_upload_success", newDoc, DbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, DocumentErrorMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new createDocumentService();
