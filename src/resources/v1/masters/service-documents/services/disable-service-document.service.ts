import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findServiceDocumentHelperService from "../helpers/validators/find-service-document.helper.service";
import { serviceDocumentErrorsMessages } from "../service-documents.messages";
import deactivateServiceDocumentHelperService from "../helpers/operations/deactivate-service-document.helper.service";
import { serviceDocumentPayload } from "../service-documents.helper";
import findServiceDocumentStateHelperService from "../helpers/validators/find-service-document-state.helper.service";
import { serviceDocumentResponse } from "../service-documents.response";

class disableServiceDocumentService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const docs = await findServiceDocumentHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        serviceDocumentErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findServiceDocumentStateHelperService.isAlreadyInactive(
        docs[0],
        serviceDocumentErrorsMessages,
      );

      const deactivated = await deactivateServiceDocumentHelperService.execute(
        docs[0],
        session,
        userId,
        dbTransactions,
        serviceDocumentErrorsMessages,
      );

      await session.commitTransaction();

      return serviceDocumentPayload("service_document_deactivate", serviceDocumentResponse(deactivated), dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, serviceDocumentErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new disableServiceDocumentService();
