import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { documentTypesErrorsMessages } from "../document-types.messages";
import findDocumentTypesHelperService from "../helpers/validators/find-document-types.helper.service";
import { populateFields, documentTypesPayload } from "../document-types.helper";
import updateDocumentTypesHelperService from "../helpers/operations/update-document-types.helper.service";
import { documentTypesResponse } from "../document-types.response";
import {
  IDocumentTypesDTO,
  toDocumentTypesDTO,
} from "../dto/create-document-types.dto";
import { IInputIDocumentTypesPayloadStrict } from "../payloads/document-types-payload";
import DocumentTypesModel from "@/database/document-types/document-types-db-model";

class updateDocumentTypesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: Partial<IInputIDocumentTypesPayloadStrict>,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body: Partial<IDocumentTypesDTO> = getRequestBody(
      request,
      payload as IInputIDocumentTypesPayloadStrict,
      toDocumentTypesDTO,
    );

    try {
      session.startTransaction();

      const documentTypes = await findDocumentTypesHelperService.execute(
        {
          _id: id,
          is_deleted: false,
          is_active: true,
        },
        documentTypesErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const current = documentTypes[0];

      if (body.title || body.label) {
        await findDocumentTypesHelperService.execute(
          {
            $or: [
              ...(body.title ? [{ title: body.title }] : []),
              ...(body.label ? [{ label: body.label }] : []),
            ],
            _id: { $ne: id },
            is_deleted: false,
          },
          documentTypesErrorsMessages,
          {
            throwIfExists: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      if (body.is_default) {
        await DocumentTypesModel.updateMany(
          { _id: { $ne: id }, is_deleted: false, is_active: true },
          { $set: { is_default: false } },
        ).session(session);
      }

      const updated = await updateDocumentTypesHelperService.execute(
        id,
        body as any,
        current,
        session,
        DbTransactions,
        documentTypesErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();
      return documentTypesPayload(
        "document_types_updated",
        documentTypesResponse(updated),
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

export default new updateDocumentTypesService();
