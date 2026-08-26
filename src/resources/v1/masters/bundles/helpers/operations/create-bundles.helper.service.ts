import { IBundleDocument } from "@/database/bundles/bundles-db-interface";
import BundleModel from "@/database/bundles/bundles-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IBundlesDTO } from "../../dto/create-bundles.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class createBundlesHelperService {
  private readonly bundleRepository: Model<IBundleDocument>;

  constructor() {
    this.bundleRepository = BundleModel;
  }

  public async execute(
    payload: Partial<IBundlesDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleDocument>> {
    try {
      const doc = new this.bundleRepository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.Bundles,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new bundle", errorMap);
    }
  }
}

export default new createBundlesHelperService();
