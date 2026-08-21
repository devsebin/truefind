import { IServiceDocumentRequirements } from "@/database/service-documents/service-documents-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { IUpdateServiceDocumentPayloadStrict } from "../../payloads/service-document-payload";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../service-documents.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { serviceDocumentErrorResponse } from "../../service-documents.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class updateServiceDocumentHelperService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: IUpdateServiceDocumentPayloadStrict,
    existing: HydratedDocument<IServiceDocumentRequirements>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
    userId?: mongoose.Types.ObjectId,
  ): Promise<HydratedDocument<IServiceDocumentRequirements>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = serviceDocumentErrorResponse(existing);
        throwError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data,
            filler: { 0: existing.name, 1: existing._id },
          }),
        );
      }

      if (payload.name !== undefined) existing.name = payload.name.trim();
      if (payload.display_name !== undefined) existing.display_name = payload.display_name.trim();
      if (payload.item_code !== undefined) existing.item_code = payload.item_code.trim();
      if (payload.document_type_id !== undefined) existing.document_type_id = new mongoose.Types.ObjectId(payload.document_type_id);
      if (payload.description !== undefined) existing.description = payload.description;
      if (payload.max_file_size !== undefined) existing.max_file_size = payload.max_file_size;
      if (payload.accepted_mimeTypes !== undefined) existing.accepted_mimeTypes = payload.accepted_mimeTypes;
      if (payload.samples !== undefined) {
        existing.samples = payload.samples ? payload.samples.map(s => new mongoose.Types.ObjectId(s)) : [];
      }
      if (payload.data_requirements !== undefined) existing.data_requirements = payload.data_requirements;
      if (payload.status_id !== undefined) existing.status_id = new mongoose.Types.ObjectId(payload.status_id);

      if (userId) {
        existing.updated_by = userId;
      }

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceDocuments,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved as HydratedDocument<IServiceDocumentRequirements>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating service document", errorMap);
    }
  }
}

export default new updateServiceDocumentHelperService();
