import { IBundleStatus } from "@/database/bundle-statuses/bundle-statuses-db-interface";
import BundleStatusesModel from "@/database/bundle-statuses/bundle-statuses-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IBundleStatusesDTO } from "../../dto/create-bundle-statuses.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class createBundleStatusesHelperService {
  private readonly bundleStatusRepository: Model<IBundleStatus>;

  constructor() {
    this.bundleStatusRepository = BundleStatusesModel;
  }

  public async execute(
    payload: Partial<IBundleStatusesDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleStatus>> {
    try {
      const doc = new this.bundleStatusRepository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.BundleStatuses,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new bundle status", errorMap);
    }
  }
}

export default new createBundleStatusesHelperService();
