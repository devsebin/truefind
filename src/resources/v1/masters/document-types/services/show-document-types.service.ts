import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { documentTypesErrorsMessages } from "../document-types.messages";
import findDocumentTypesHelperService from "../helpers/validators/find-document-types.helper.service";
import { populateFields, documentTypesPayload } from "../document-types.helper";
import { documentTypesResponse } from "../document-types.response";

class showDocumentTypesService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];

    try {
      const documentType = await findDocumentTypesHelperService.execute(
        { _id: id },
        documentTypesErrorsMessages,
        {
          lean: true,
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
        },
      );

      return documentTypesPayload(
        "document_types_fetched",
        documentTypesResponse(documentType[0]),
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, documentTypesErrorsMessages, err.data);
    }
  }
}

export default new showDocumentTypesService();
