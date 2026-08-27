import { IBundleCountryConfigurationDocument } from "@/database/bundle-country-configuration/bundle-country-configuration-db-interface";
import BundleCountryConfigurationModel from "@/database/bundle-country-configuration/bundle-country-configuration-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IBundleCountryConfigurationDTO } from "../../dto/bundle-country-configuration.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class CreateBundleCountryConfigurationHelperService {
  private readonly repository: Model<IBundleCountryConfigurationDocument>;

  constructor() {
    this.repository = BundleCountryConfigurationModel;
  }

  public async execute(
    payload: Partial<IBundleCountryConfigurationDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleCountryConfigurationDocument>> {
    try {
      const doc = new this.repository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.BundleCountryConfigurations,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while creating new bundle country configuration",
        errorMap,
      );
    }
  }
}

export default new CreateBundleCountryConfigurationHelperService();
