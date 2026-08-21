import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findServiceDocumentHelperService from "../helpers/validators/find-service-document.helper.service";
import { serviceDocumentErrorsMessages } from "../service-documents.messages";
import deleteServiceDocumentHelperService from "../helpers/operations/delete-service-document.helper.service";
import { serviceDocumentPayload } from "../service-documents.helper";
import findServiceDocumentStateHelperService from "../helpers/validators/find-service-document-state.helper.service";
import { serviceDocumentResponse } from "../service-documents.response";

class deleteServiceDocumentService {
  constructor() {}

  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    is_force: boolean,
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

      await findServiceDocumentStateHelperService.isAlreadyDeleted(
        docs[0],
        serviceDocumentErrorsMessages,
      );

      const deletedDoc = await deleteServiceDocumentHelperService.execute(
        docs[0],
        session,
        userId,
        is_force,
        dbTransactions,
        serviceDocumentErrorsMessages,
      );

      await session.commitTransaction();

      return serviceDocumentPayload("service_document_deleted", serviceDocumentResponse(deletedDoc), dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, serviceDocumentErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new deleteServiceDocumentService();
