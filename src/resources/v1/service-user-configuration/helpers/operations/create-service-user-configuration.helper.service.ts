import { IUserTaskMapping } from "@/database/service-user-configuration/service-user-configuration-db-interface";
import TaskUserMappingModel from "@/database/service-user-configuration/service-user-configuration-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class CreateServiceUserConfigurationHelperService {
  private readonly repository: Model<IUserTaskMapping>;

  constructor() {
    this.repository = TaskUserMappingModel;
  }

  public async bulkUpsert(
    userId: mongoose.Types.ObjectId,
    serviceIds: mongoose.Types.ObjectId[],
    currentUserId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
    serviceEligibilityMap?: Map<string, "pending" | "success">,
  ): Promise<HydratedDocument<IUserTaskMapping>[]> {
    try {
      const ops = serviceIds.map((serviceId) => {
        const updateFields: any = {
          user_id: userId,
          task_id: serviceId,
          is_deleted: false,
          is_active: true,
        };

        if (currentUserId) {
          updateFields.updated_by = currentUserId;
        }

        const eligibilityStatus =
          serviceEligibilityMap?.get(serviceId.toString()) ?? "pending";

        const updateDoc: any = {
          $set: updateFields,
          $setOnInsert: {
            eligibility_status: eligibilityStatus,
            ...(currentUserId ? { created_by: currentUserId } : {}),
          },
        };

        return {
          updateOne: {
            filter: { user_id: userId, task_id: serviceId },
            update: updateDoc,
            upsert: true,
          },
        };
      });

      const writeResult = await this.repository.bulkWrite(ops, { session });

      const updatedRecords = await this.repository
        .find({
          user_id: userId,
          task_id: { $in: serviceIds },
        })
        .session(session);

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceUserConfigurations,
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
      rethrowIfKnown(error, "Error while bulk writing service user configurations", errorMap);
    }
  }

  public async createSingle(
    userId: mongoose.Types.ObjectId,
    serviceId: mongoose.Types.ObjectId,
    eligibilityStatus: any,
    currentUserId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IUserTaskMapping>> {
    try {
      const doc = new this.repository({
        user_id: userId,
        task_id: serviceId,
        eligibility_status: eligibilityStatus || "pending",
        is_active: true,
        is_deleted: false,
        ...(currentUserId ? { created_by: currentUserId, updated_by: currentUserId } : {}),
      });

      const saved = await doc.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceUserConfigurations,
          apiMethods.POST,
          operationTypes.Create,
          saved,
        ),
      );

      return saved;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating single service user configuration", errorMap);
    }
  }
}

export default new CreateServiceUserConfigurationHelperService();
