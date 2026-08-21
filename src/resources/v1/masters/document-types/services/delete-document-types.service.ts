import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { documentTypesErrorsMessages } from "../document-types.messages";
import findDocumentTypesHelperService from "../helpers/validators/find-document-types.helper.service";
import deleteDocumentTypesHelperService from "../helpers/operations/delete-document-types.helper.service";
import { documentTypesPayload } from "../document-types.helper";
import { documentTypesResponse } from "../document-types.response";

class deleteDocumentTypesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    force: boolean = false,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const documentTypes = await findDocumentTypesHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
        },
        documentTypesErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const doc = documentTypes[0];

      if (doc.is_default) {
        throw new Error("cannot_delete_default");
      }

      const deleted = await deleteDocumentTypesHelperService.execute(
        doc,
        session,
        userId,
        force,
        DbTransactions,
        documentTypesErrorsMessages,
      );

      await session.commitTransaction();
      return documentTypesPayload(
        "document_types_deleted",
        documentTypesResponse(deleted),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, documentTypesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new deleteDocumentTypesService();
