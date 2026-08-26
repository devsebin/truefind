import { IBundleUserMappingStatus } from "@/database/bundle-user-mapping-status/bundle-user-mapping-status-db-interface";
import BundleUserMappingStatusModel from "@/database/bundle-user-mapping-status/bundle-user-mapping-status-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IBundleUserMappingStatusDTO } from "../../dto/create-bundle-user-mapping-status.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class createBundleUserMappingStatusHelperService {
  private readonly bundleUserMappingStatusRepository: Model<IBundleUserMappingStatus>;

  constructor() {
    this.bundleUserMappingStatusRepository = BundleUserMappingStatusModel;
  }

  public async execute(
    payload: Partial<IBundleUserMappingStatusDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleUserMappingStatus>> {
    try {
      const doc = new this.bundleUserMappingStatusRepository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.BundleUserMappingStatuses,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new bundle user mapping status", errorMap);
    }
  }
}

export default new createBundleUserMappingStatusHelperService();
