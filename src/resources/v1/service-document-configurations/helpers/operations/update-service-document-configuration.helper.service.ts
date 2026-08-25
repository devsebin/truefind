import { IServiceDocumentConfiguration } from "@/database/service-document-configuration/service-document-configuration-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwServiceDocumentConfigError } from "../../service-document-configurations.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class UpdateServiceDocumentConfigurationHelperService {
  public async execute(
    id: mongoose.Types.ObjectId,
    payload: any,
    existing: HydratedDocument<IServiceDocumentConfiguration>,
    userId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceDocumentConfiguration>> {
    try {
      const snapshot = existing.toObject();

      let changed = false;

      if (payload.required_documents !== undefined) {
        existing.required_documents = payload.required_documents.map((doc: any) => ({
          document_id: doc.document_id,
          is_mandatory: doc.is_mandatory,
          exemption_documents: doc.exemption_documents,
          ...(userId ? { updated_by: userId } : {}),
        }));
        changed = true;
      }

      if (payload.is_active !== undefined && payload.is_active !== existing.is_active) {
        existing.is_active = payload.is_active;
        changed = true;
      }

      if (payload.status_id !== undefined && payload.status_id.toString() !== existing.status_id?.toString()) {
        existing.status_id = payload.status_id;
        changed = true;
      }

      if (payload.is_deleted !== undefined && payload.is_deleted !== existing.is_deleted) {
        existing.is_deleted = payload.is_deleted;
        if (payload.is_deleted) {
          existing.deleted_at = new Date();
          if (userId) existing.deleted_by = userId;
        }
        changed = true;
      }

      if (!changed) {
        throwServiceDocumentConfigError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data: { id },
          }),
        );
      }

      if (userId) {
        existing.updated_by = userId;
      }

      const saved = await existing.save({ session });
      const changes = updatedFields(saved.toObject(), snapshot);

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceDocumentConfigurations,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating service document configuration", errorMap);
    }
  }
}

export default new UpdateServiceDocumentConfigurationHelperService();
