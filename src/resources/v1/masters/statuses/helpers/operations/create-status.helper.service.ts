import { IStatus } from "@/database/status/status-db-interface";
import StatusModel from "@/database/status/status-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IStatusDTO } from "../../dto/status.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class createStatusHelperService {
  private readonly statusRepository: Model<IStatus>;

  constructor() {
    this.statusRepository = StatusModel;
  }
  public async execute(
    payload: Partial<IStatusDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IStatus>> {
    try {
      const doc = new this.statusRepository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.Status,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new status", errorMap);
    }
  }
}

export default new createStatusHelperService();
