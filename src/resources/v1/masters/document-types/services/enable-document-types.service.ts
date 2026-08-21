import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { documentTypesErrorsMessages } from "../document-types.messages";
import findDocumentTypesHelperService from "../helpers/validators/find-document-types.helper.service";
import activateDocumentTypesHelperService from "../helpers/operations/activate-document-types.helper.service";
import { documentTypesPayload } from "../document-types.helper";
import { documentTypesResponse } from "../document-types.response";

class enableDocumentTypesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const documentTypes = await findDocumentTypesHelperService.execute(
        {
          _id: id,
          is_deleted: false,
          is_active: { $in: [true, false] },
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

      const activated = await activateDocumentTypesHelperService.execute(
        doc,
        session,
        userId,
        DbTransactions,
        documentTypesErrorsMessages,
      );

      await session.commitTransaction();
      return documentTypesPayload(
        "document_types_activate",
        documentTypesResponse(activated),
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

export default new enableDocumentTypesService();
