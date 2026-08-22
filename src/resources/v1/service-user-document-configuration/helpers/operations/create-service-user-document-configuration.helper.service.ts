import { IServiceUserDocumentConfiguration } from "@/database/service-user-document-configuration/service-user-document-configuration-db-interface";
import ServiceUserDocumentConfigurationsModel, {
  ServiceUserDocumentConfigurationStatus,
} from "@/database/service-user-document-configuration/service-user-document-configuration-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class CreateServiceUserDocumentConfigurationHelperService {
  private readonly repository: Model<IServiceUserDocumentConfiguration>;

  constructor() {
    this.repository = ServiceUserDocumentConfigurationsModel;
  }

  public async createSingle(
    userId: mongoose.Types.ObjectId,
    serviceId: mongoose.Types.ObjectId,
    documentRequirementId: mongoose.Types.ObjectId,
    isMandatory: boolean,
    status: ServiceUserDocumentConfigurationStatus,
    currentUserId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceUserDocumentConfiguration>> {
    try {
      const doc = new this.repository({
        user_id: userId,
        task_id: serviceId,
        document_requirement_id: documentRequirementId,
        is_mandatory: isMandatory,
        current_status: status || ServiceUserDocumentConfigurationStatus.PENDING,
        uploads: [],
        is_active: true,
        is_deleted: false,
        ...(currentUserId
          ? { created_by: currentUserId, updated_by: currentUserId }
          : {}),
      });

      const saved = await doc.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceUserDocumentConfigurations,
          apiMethods.POST,
          operationTypes.Create,
          saved,
        ),
      );

      return saved;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while creating single service user document configuration",
        errorMap,
      );
    }
  }

  public async bulkUpsert(
    userId: mongoose.Types.ObjectId,
    configs: Array<{
      serviceId: mongoose.Types.ObjectId;
      documentRequirementId: mongoose.Types.ObjectId;
      isMandatory: boolean;
      status?: ServiceUserDocumentConfigurationStatus;
    }>,
    currentUserId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceUserDocumentConfiguration>[]> {
    try {
      if (configs.length === 0) return [];

      const ops = configs.map((cfg) => {
        const updateFields: any = {
          user_id: userId,
          task_id: cfg.serviceId,
          document_requirement_id: cfg.documentRequirementId,
          is_mandatory: cfg.isMandatory,
          is_deleted: false,
          is_active: true,
        };

        if (currentUserId) {
          updateFields.updated_by = currentUserId;
        }

        const updateDoc: any = {
          $set: updateFields,
          $setOnInsert: {
            current_status:
              cfg.status || ServiceUserDocumentConfigurationStatus.PENDING,
            uploads: [],
            ...(currentUserId ? { created_by: currentUserId } : {}),
          },
        };

        return {
          updateOne: {
            filter: {
              user_id: userId,
              task_id: cfg.serviceId,
              document_requirement_id: cfg.documentRequirementId,
            },
            update: updateDoc,
            upsert: true,
          },
        };
      });

      const writeResult = await this.repository.bulkWrite(ops, { session });

      const filterConditions = configs.map((c) => ({
        user_id: userId,
        task_id: c.serviceId,
        document_requirement_id: c.documentRequirementId,
      }));

      const updatedRecords = await this.repository
        .find({ $or: filterConditions })
        .session(session);

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceUserDocumentConfigurations,
          apiMethods.POST,
          operationTypes.Create,
          {
            writeResult,
            updatedRecords,
          },
        ),
      );

      return updatedRecords;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while bulk writing service user document configurations",
        errorMap,
      );
    }
  }
}

export default new CreateServiceUserDocumentConfigurationHelperService();
