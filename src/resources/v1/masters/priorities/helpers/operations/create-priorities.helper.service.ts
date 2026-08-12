import IStatus from "@/database/priorities/priorities-db-interface";
import PrioritiesModel from "@/database/priorities/priorities-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IPrioritiesDTO } from "../../dto/create-priorities.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class createPrioritiesHelperService {
  private readonly prioritiesRepository: Model<IStatus>;

  constructor() {
    this.prioritiesRepository = PrioritiesModel;
  }

  public async execute(
    payload: Partial<IPrioritiesDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IStatus>> {
    try {
      const doc = new this.prioritiesRepository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.Priorities,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new priority", errorMap);
    }
  }
}

export default new createPrioritiesHelperService();
