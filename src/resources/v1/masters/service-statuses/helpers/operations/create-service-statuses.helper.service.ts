import { IServiceStatus } from "@/database/service-status/service-status-db-interface";
import ServiceStatusModel from "@/database/service-status/service-status-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IServiceStatusesDTO } from "../../dto/create-service-statuses.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class createServiceStatusesHelperService {
  private readonly serviceStatusRepository: Model<IServiceStatus>;

  constructor() {
    this.serviceStatusRepository = ServiceStatusModel;
  }

  public async execute(
    payload: Partial<IServiceStatusesDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceStatus>> {
    try {
      const doc = new this.serviceStatusRepository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.ServiceStatus,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new service status", errorMap);
    }
  }
}

export default new createServiceStatusesHelperService();
