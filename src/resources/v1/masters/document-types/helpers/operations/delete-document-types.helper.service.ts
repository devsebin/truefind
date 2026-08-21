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

class deleteDocumentTypesHelperService {
  constructor() { }

  public async execute(
    existing: HydratedDocument<IDocumentType>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    force: boolean,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IDocumentType>> {
    try {
      if (existing.is_deleted) {
        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Document type is already deleted",
            data: documentTypesErrorResponse(existing),
            filler: { 0: existing.title, 1: existing._id },
          }),
        );
      }

      if (existing.is_active && !force) {
        throwError(
          "confirmation_required",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Confirmation required to delete document type",
            data: documentTypesErrorResponse(existing),
          }),
        );
      }

      existing.is_deleted = true;
      existing.is_active = false;
      existing.deleted_by = userId;
      existing.deleted_at = new Date();

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.DocumentTypes,
          apiMethods.DELETE,
          operationTypes.Delete,
          saved,
        ),
      );

      return saved as HydratedDocument<IDocumentType>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deleting document type", errorMap);
    }
  }
}

export default new deleteDocumentTypesHelperService();
