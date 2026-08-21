import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { serviceDocumentErrorsMessages } from "../service-documents.messages";
import findServiceDocumentHelperService from "../helpers/validators/find-service-document.helper.service";
import { populateFields, serviceDocumentPayload } from "../service-documents.helper";
import { serviceDocumentResponse } from "../service-documents.response";

class showServiceDocumentService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];

    try {
      const doc = await findServiceDocumentHelperService.execute(
        { _id: id } as any,
        serviceDocumentErrorsMessages,
        {
          lean: true,
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
        },
      );

      return serviceDocumentPayload(
        "service_document_fetched",
        serviceDocumentResponse(doc[0]),
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, serviceDocumentErrorsMessages, err.data);
    }
  }
}

export default new showServiceDocumentService();
