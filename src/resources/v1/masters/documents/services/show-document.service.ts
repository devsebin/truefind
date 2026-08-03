import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { FilesSuccessPayload, populateFields } from "../documents.helper";
import { DocumentErrorMessages } from "../documents.messages";
import { generateS3SignedUrl } from "@/services/aws/s3-helper";
import findDocumentHelperService from "../helpers/validators/find-document.helper.service";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";

class showDocumentService {
  async execute(
    documentId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const documents = await findDocumentHelperService.execute(
        {
          _id: documentId,
          is_deleted: false,
          is_active: true,
        },
        DocumentErrorMessages,
        {
          throwIfNotFound: true,
          populate: populateFields,
          session,
        },
      );
      const document = documents[0];

      if (document.keys && document.keys.original) {
        document.keys.original = await generateS3SignedUrl(
          document.keys.original,
          3600,
        );
      }

      if (document.keys && document.keys.thumbnails) {
        document.keys.thumbnails = await Promise.all(
          document.keys.thumbnails.map(async (thumbnail: string) => {
            return await generateS3SignedUrl(thumbnail, 3600);
          }),
        );
      }

      // Log DB transaction
      DbTransactions.push(
        await createDbTransaction(
          tableName.Documents,
          apiMethods.GET,
          operationTypes.Read,
          document,
        ),
      );

      await session.commitTransaction();

      return FilesSuccessPayload("file_fetched", document, DbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, DocumentErrorMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new showDocumentService();
