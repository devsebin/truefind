import { IServiceUserDocumentConfiguration } from "@/database/service-user-document-configuration/service-user-document-configuration-db-interface";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { tableName } from "@/utils/definitions/constants/table-names";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import mongoose, { HydratedDocument } from "mongoose";

class DeactivateServiceUserDocumentConfigurationHelperService {
  public async execute(
    doc: HydratedDocument<IServiceUserDocumentConfiguration>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId | undefined,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceUserDocumentConfiguration>> {
    try {
      doc.is_active = false;
      if (userId) {
        doc.updated_by = userId;
      }

      const updated = await doc.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceUserDocumentConfigurations,
          apiMethods.PATCH,
          operationTypes.deactivate,
          updated,
        ),
      );

      return updated;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while deactivating service user document configuration",
        errorMap,
      );
    }
  }
}

export default new DeactivateServiceUserDocumentConfigurationHelperService();
