import { IServiceUserDocumentConfiguration } from "@/database/service-user-document-configuration/service-user-document-configuration-db-interface";
import { ServiceUserDocumentConfigurationStatus } from "@/database/service-user-document-configuration/service-user-document-configuration-db-model";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { tableName } from "@/utils/definitions/constants/table-names";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import mongoose, { HydratedDocument } from "mongoose";

class UploadServiceUserDocumentHelperService {
  public async execute(
    doc: HydratedDocument<IServiceUserDocumentConfiguration>,
    documentId: mongoose.Types.ObjectId,
    employeeId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceUserDocumentConfiguration>> {
    try {
      if (!Array.isArray(doc.uploads)) {
        doc.uploads = [];
      }

      doc.uploads.push({
        document_id: documentId,
        uploaded_at: new Date(),
        status: ServiceUserDocumentConfigurationStatus.PENDING,
      });

      doc.current_status = ServiceUserDocumentConfigurationStatus.PENDING;
      if (employeeId) {
        doc.updated_by = employeeId;
      }

      const updated = await doc.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceUserDocumentConfigurations,
          apiMethods.POST,
          operationTypes.Update,
          updated,
        ),
      );

      return updated;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while recording document upload for service user document configuration",
        errorMap,
      );
    }
  }
}

export default new UploadServiceUserDocumentHelperService();
