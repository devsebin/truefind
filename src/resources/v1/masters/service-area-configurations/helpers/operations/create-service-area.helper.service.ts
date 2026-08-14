import { IServiceAreaConfigurationDocument } from "@/database/service-area-configuration/service-area-configuration.interface";
import ServiceAreaConfigurationModel from "@/database/service-area-configuration/service-area-configuration.model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class CreateServiceAreaHelperService {
  private readonly repository: Model<IServiceAreaConfigurationDocument>;

  constructor() {
    this.repository = ServiceAreaConfigurationModel;
  }

  public async execute(
    serviceId: mongoose.Types.ObjectId,
    suburbs: any[],
    userId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceAreaConfigurationDocument>[]> {
    try {
      const ops = suburbs.map((suburbConfig: any) => {
        const updateFields: any = {
          service_id: serviceId,
          suburb_id: suburbConfig.suburb_id,
          is_deleted: false,
          ...suburbConfig,
        };

        if (userId) {
          updateFields.updated_by = userId;
        }

        const updateDoc: any = {
          $set: updateFields,
        };

        if (userId) {
          updateDoc.$setOnInsert = {
            created_by: userId,
          };
        }

        return {
          updateOne: {
            filter: { service_id: serviceId, suburb_id: suburbConfig.suburb_id },
            update: updateDoc,
            upsert: true,
          },
        };
      });

      const writeResult = await this.repository.bulkWrite(ops, { session });

      const suburbIds = suburbs.map(s => s.suburb_id);
      const updatedRecords = await this.repository.find({
        service_id: serviceId,
        suburb_id: { $in: suburbIds },
      })
        .session(session);

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceAreaConfigurations,
          apiMethods.POST,
          operationTypes.Create,
          {
            writeResult,
            updatedRecords,
          }
        )
      );

      return updatedRecords;
    } catch (error) {
      rethrowIfKnown(error, "Error while bulk writing service area configurations", errorMap);
    }
  }
}

export default new CreateServiceAreaHelperService();
