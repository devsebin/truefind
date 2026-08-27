import { IBundleLocationConfigStatus } from "@/database/bundle-location-config-status/bundle-location-config-status-db-interface";
import BundleLocationConfigStatusesModel from "@/database/bundle-location-config-status/bundle-location-config-status-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IBundleLocationConfigStatusesDTO } from "../../dto/create-bundle-location-config-statuses.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class createBundleLocationConfigStatusesHelperService {
  private readonly bundleLocationConfigStatusRepository: Model<IBundleLocationConfigStatus>;

  constructor() {
    this.bundleLocationConfigStatusRepository =
      BundleLocationConfigStatusesModel;
  }

  public async execute(
    payload: Partial<IBundleLocationConfigStatusesDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleLocationConfigStatus>> {
    try {
      const doc = new this.bundleLocationConfigStatusRepository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.BundleLocationConfigStatuses,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while creating new bundle location config status",
        errorMap,
      );
    }
  }
}

export default new createBundleLocationConfigStatusesHelperService();
