import findStatusHelperService from "@/resources/v1/masters/statuses/helpers/validators/find-status.helper.service";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { FilesSuccessPayload } from "../documents.helper";
import { DocumentErrorMessages } from "../documents.messages";
import findDocumentHelperService from "../helpers/validators/find-document.helper.service";
import deleteDocumentHelperService from "../helpers/operations/delete-document.helper.service";
import { deleteS3Objects } from "@/services/aws/s3-helper";
class deleteDocumentService {
  async execute(
    documentId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const documents = await findDocumentHelperService.execute(
        { _id: documentId },
        DocumentErrorMessages,
        {
          throwIfNotFound: true,
          session,
        },
      );
      const document = documents[0];

      const deletedStatuses = await findStatusHelperService.execute(
        { label: "deleted" },
        DocumentErrorMessages,
        {
          throwIfNotFound: true,
          session,
        },
      );
      const deletedStatus = deletedStatuses[0];

      await deleteDocumentHelperService.execute(
        document,
        deletedStatus._id,
        userId,
        session,
        DbTransactions,
        DocumentErrorMessages,
      );

      // Delete S3 Files
      const original = document.keys.original;
      const thumbnails = document.keys.thumbnails ?? [];
      const allKeys = [original, ...thumbnails];
      await deleteS3Objects(allKeys);

      await session.commitTransaction();

      return FilesSuccessPayload("file_deleted", document, DbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, DocumentErrorMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new deleteDocumentService();
