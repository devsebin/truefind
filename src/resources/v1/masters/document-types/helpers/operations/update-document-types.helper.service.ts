import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import mongoose, { HydratedDocument } from "mongoose";
import { IInputIDocumentTypesPayloadStrict } from "../../payloads/document-types-payload";
import IDocumentType from "@/database/document-types/document-types-db-interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../document-types.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { documentTypesErrorResponse } from "../../document-types.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class updateDocumentTypesHelperService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: Partial<IInputIDocumentTypesPayloadStrict>,
    existing: HydratedDocument<IDocumentType>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IDocumentType>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = documentTypesErrorResponse(existing);
        throwError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data,
            filler: { 0: existing.label, 1: existing._id },
          }),
        );
      }

      if (payload.title !== undefined) existing.title = payload.title;
      if (payload.label !== undefined) existing.label = payload.label;
      if (payload.color !== undefined) existing.color = payload.color;
      if (payload.is_default !== undefined) existing.is_default = payload.is_default;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.DocumentTypes,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved as HydratedDocument<IDocumentType>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating document type", errorMap);
    }
  }
}

export default new updateDocumentTypesHelperService();
