import { SingleResponse } from "@/utils/responses/success.response";
import { IInputIDocumentTypesPayloadStrict } from "../payloads/document-types-payload";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toDocumentTypesDTO } from "../dto/create-document-types.dto";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { documentTypesErrorsMessages } from "../document-types.messages";
import { populateFields, documentTypesPayload } from "../document-types.helper";
import createDocumentTypesHelperService from "../helpers/operations/create-document-types.helper.service";
import { documentTypesResponse } from "../document-types.response";
import DocumentTypesModel from "@/database/document-types/document-types-db-model";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";

class createDocumentTypesService {
  public async execute(
    request: Request,
    payload?: IInputIDocumentTypesPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toDocumentTypesDTO);

    try {
      session.startTransaction();

      const existingDuplicate = await DocumentTypesModel.findOne({
        $or: [
          { title: body.title },
          { label: body.label },
        ],
        is_deleted: { $in: [true, false] },
      }).session(session);

      if (existingDuplicate) {
        if (!existingDuplicate.is_deleted && existingDuplicate.is_active) {
          throw new Error("already_exists");
        }

        existingDuplicate.title = body.title;
        existingDuplicate.label = body.label;
        existingDuplicate.color = body.color;

        const defaultDocTypeExists = await DocumentTypesModel.findOne({
          is_default: true,
          is_deleted: false,
          is_active: true,
          _id: { $ne: existingDuplicate._id },
        }).session(session);

        if (!defaultDocTypeExists) {
          existingDuplicate.is_default = true;
        } else if (body.is_default) {
          existingDuplicate.is_default = true;
        }

        if (existingDuplicate.is_default) {
          await DocumentTypesModel.updateMany(
            { _id: { $ne: existingDuplicate._id }, is_deleted: false, is_active: true },
            { $set: { is_default: false } },
          ).session(session);
        }

        existingDuplicate.is_deleted = false;
        existingDuplicate.is_active = true;

        const saved = await existingDuplicate.save({ session });
        await saved.populate(populateFields);

        DbTransactions.push(
          await createDbTransaction(
            tableName.DocumentTypes,
            apiMethods.POST,
            operationTypes.Create,
            saved.toObject(),
          ),
        );

        await session.commitTransaction();
        return documentTypesPayload(
          "document_types_created",
          documentTypesResponse(saved),
          DbTransactions,
        );
      }

      const defaultDocTypeExists = await DocumentTypesModel.findOne({
        is_default: true,
        is_deleted: false,
        is_active: true,
      }).session(session);

      if (!defaultDocTypeExists) {
        body.is_default = true;
      }

      if (body.is_default) {
        await DocumentTypesModel.updateMany(
          { is_deleted: false, is_active: true },
          { $set: { is_default: false } },
        ).session(session);
      }

      const newDocType = await createDocumentTypesHelperService.execute(
        body,
        session,
        DbTransactions,
        documentTypesErrorsMessages,
      );

      await newDocType.populate(populateFields);

      await session.commitTransaction();
      return documentTypesPayload(
        "document_types_created",
        documentTypesResponse(newDocType),
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

export default new createDocumentTypesService();
