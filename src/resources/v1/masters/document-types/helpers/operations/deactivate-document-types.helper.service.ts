import IDocumentType from "@/database/document-types/document-types-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../document-types.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { documentTypesErrorResponse } from "../../document-types.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class deactivateDocumentTypesHelperService {
  constructor() { }

  public async execute(
    existing: HydratedDocument<IDocumentType>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IDocumentType>> {
    try {
      if (!existing.is_active || existing.is_deleted) {
        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Document type is already inactive",
            data: documentTypesErrorResponse(existing),
            filler: { 0: existing.title, 1: existing._id },
          }),
        );
      }

      existing.is_active = false;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.DocumentTypes,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<IDocumentType>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deactivating document type", errorMap);
    }
  }
}

export default new deactivateDocumentTypesHelperService();
