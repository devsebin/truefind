import { IBundleAreaConfigurationDocument } from "@/database/bundle-area-configuration/bundle-area-configuration-db-interface";
import BundleAreaConfigurationModel from "@/database/bundle-area-configuration/bundle-area-configuration-db-model";
import { IBundleCountryConfigurationDocument } from "@/database/bundle-country-configuration/bundle-country-configuration-db-interface";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { getActiveBundleLocationStatusId } from "@/utils/plugins/bundle-location-config-status.plugin";

class CreateBundleAreaHelperService {
  private readonly repository: Model<IBundleAreaConfigurationDocument>;

  constructor() {
    this.repository = BundleAreaConfigurationModel;
  }

  public async execute(
    countryConfig: HydratedDocument<IBundleCountryConfigurationDocument>,
    suburbIds: mongoose.Types.ObjectId[],
    userId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleAreaConfigurationDocument>[]> {
    try {
      const activeStatusId = await getActiveBundleLocationStatusId();

      const ops = suburbIds.map((suburbId) => {
        const updateFields: any = {
          bundle_id: countryConfig.bundle_id,
          suburb_id: suburbId,
          country_configuration_id: countryConfig._id,
          is_active: true,
          is_deleted: false,
          is_callout_bundle: countryConfig.is_callout_bundle,
          is_fixed_price: countryConfig.is_fixed_price,
          currency_id: countryConfig.currency_id,
          price: countryConfig.price,
          unit_id: countryConfig.unit_id,
          minimum_price: countryConfig.minimum_price,
          maximum_price: countryConfig.maximum_price,
          call_out_fee: countryConfig.call_out_fee,
          estimated_time: countryConfig.estimated_time,
          estimated_time_unit: countryConfig.estimated_time_unit,
          individual_services_total: countryConfig.individual_services_total,
          bundle_discount_type: countryConfig.bundle_discount_type,
          bundle_discount_value: countryConfig.bundle_discount_value,
          status_id: activeStatusId,
        };

        if (userId) {
          updateFields.updated_by = userId;
        }

        const updateDoc: any = {
          $set: updateFields,
        };

        if (userId) {
          updateDoc.$setOnInsert = {
            created_by: userId,
          };
        }

        return {
          updateOne: {
            filter: {
              bundle_id: countryConfig.bundle_id,
              suburb_id: suburbId,
            },
            update: updateDoc,
            upsert: true,
          },
        };
      });

      const writeResult = await this.repository.bulkWrite(ops, { session });

      const updatedRecords = await this.repository
        .find({
          bundle_id: countryConfig.bundle_id,
          suburb_id: { $in: suburbIds },
        })
        .session(session);

      dbTransactions.push(
        await createDbTransaction(
          tableName.BundleAreaConfigurations,
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
      rethrowIfKnown(
        error,
        "Error while bulk creating bundle area configurations",
        errorMap,
      );
    }
  }
}

export default new CreateBundleAreaHelperService();
