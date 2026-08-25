import { IServiceDocumentConfiguration } from "@/database/service-document-configuration/service-document-configuration-db-interface";
import ServiceDocumentConfigurationModel from "@/database/service-document-configuration/service-document-configuration-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { ServiceDocumentConfigurationDTO } from "../../dto/service-document-configuration.dto";

class CreateServiceDocumentConfigurationHelperService {
  private readonly repository: Model<IServiceDocumentConfiguration>;

  constructor() {
    this.repository = ServiceDocumentConfigurationModel;
  }

  public async execute(
    data: ServiceDocumentConfigurationDTO,
    userId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceDocumentConfiguration>> {
    try {
      const docData: any = {
        service_id: data.service_id,
        required_documents: data.required_documents.map((doc) => ({
          document_id: doc.document_id,
          is_mandatory: doc.is_mandatory,
          exemption_documents: doc.exemption_documents,
          ...(userId ? { created_by: userId, updated_by: userId } : {}),
        })),
        ...(userId ? { created_by: userId, updated_by: userId } : {}),
      };

      const newConfig = new this.repository(docData);
      const savedConfig = await newConfig.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceDocumentConfigurations,
          apiMethods.POST,
          operationTypes.Create,
          savedConfig,
        ),
      );

      return savedConfig as HydratedDocument<IServiceDocumentConfiguration>;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating service document configuration", errorMap);
    }
  }
}

export default new CreateServiceDocumentConfigurationHelperService();
