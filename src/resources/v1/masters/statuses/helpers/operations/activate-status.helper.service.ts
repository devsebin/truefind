import { IStatus } from "@/database/status/status-db-interface";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import mongoose, { HydratedDocument, Model } from "mongoose";
import StatusModel from "@/database/status/status-db-model";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";

class activateStatusHelperService {
  private readonly statusRepository = Model<IStatus>;

  constructor() {
    this.statusRepository = StatusModel;
  }
  async execute(
    status: HydratedDocument<IStatus>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
    updated_by: mongoose.Types.ObjectId,
  ): Promise<HydratedDocument<IStatus>> {
    const snapshot = status;
    try {
      const updatedDocument = await this.statusRepository.findOneAndUpdate(
        { _id: status._id },
        {
          $set: {
            is_deleted: false,
            updated_by: updated_by,
            is_active: true,
          },
        },
        { session, returnDocument: "after" },
      );
      const changes = updatedFields(updatedDocument, snapshot);

      DbTransactions.push(
        await createDbTransaction(
          tableName.Status,
          apiMethods.PATCH,
          operationTypes.activate,
          updatedDocument,
          changes,
        ),
      );

      return updatedDocument as HydratedDocument<IStatus>;
    } catch (error) {
      rethrowIfKnown(error, "Error while activating status", errorMap);
    }
  }
}

export default new activateStatusHelperService();
