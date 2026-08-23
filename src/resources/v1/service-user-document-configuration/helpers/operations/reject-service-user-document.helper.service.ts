import { IServiceUserDocumentConfiguration } from "@/database/service-user-document-configuration/service-user-document-configuration-db-interface";
import { ServiceUserDocumentConfigurationStatus } from "@/database/service-user-document-configuration/service-user-document-configuration-db-model";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { tableName } from "@/utils/definitions/constants/table-names";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import mongoose, { HydratedDocument } from "mongoose";

class RejectServiceUserDocumentHelperService {
  public async execute(
    doc: HydratedDocument<IServiceUserDocumentConfiguration>,
    reason: string,
    employeeId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceUserDocumentConfiguration>> {
    try {
      const now = new Date();

      if (Array.isArray(doc.uploads) && doc.uploads.length > 0) {
        const latestUpload = doc.uploads[doc.uploads.length - 1];
        latestUpload.status = ServiceUserDocumentConfigurationStatus.REJECTED;
        latestUpload.verified_at = now;
        latestUpload.validation_notes = reason;
        if (employeeId) {
          latestUpload.verified_by = employeeId;
        }
      }

      doc.current_status = ServiceUserDocumentConfigurationStatus.REJECTED;
      doc.verified_at = now;
      if (employeeId) {
        doc.verified_by = employeeId;
        doc.updated_by = employeeId;
      }

      const updated = await doc.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceUserDocumentConfigurations,
          apiMethods.PATCH,
          operationTypes.Update,
          updated,
        ),
      );

      return updated;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while rejecting service user document configuration",
        errorMap,
      );
    }
  }
}

export default new RejectServiceUserDocumentHelperService();
