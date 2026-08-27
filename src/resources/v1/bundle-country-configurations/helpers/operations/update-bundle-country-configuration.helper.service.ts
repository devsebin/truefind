import { IBundleCountryConfigurationDocument } from "@/database/bundle-country-configuration/bundle-country-configuration-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwBundleCountryConfigError } from "../../bundle-country-configurations.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class UpdateBundleCountryConfigurationHelperService {
  constructor() {}

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: any,
    existing: HydratedDocument<IBundleCountryConfigurationDocument>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleCountryConfigurationDocument>> {
    try {
      const snapshot = existing.toObject();

      const fieldsToUpdate = [
        "bundle_id",
        "country_id",
        "currency_id",
        "unit_id",
        "is_callout_bundle",
        "is_fixed_price",
        "price",
        "minimum_price",
        "maximum_price",
        "call_out_fee",
        "estimated_time",
        "estimated_time_unit",
        "individual_services_total",
        "bundle_discount_type",
        "bundle_discount_value",
        "status_id",
        "is_active",
      ];

      let changedCount = 0;
      fieldsToUpdate.forEach((field) => {
        if (
          payload[field] !== undefined &&
          payload[field] !== (existing as any)[field]
        ) {
          (existing as any)[field] = payload[field];
          changedCount++;
        }
      });

      if (changedCount === 0) {
        throwBundleCountryConfigError(
          "something_went_wrong",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data: { id },
          }),
        );
      }

      const saved = await existing.save({ session });
      const changes = updatedFields(saved.toObject(), snapshot);

      dbTransactions.push(
        await createDbTransaction(
          tableName.BundleCountryConfigurations,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while updating bundle country configuration",
        errorMap,
      );
    }
  }
}

export default new UpdateBundleCountryConfigurationHelperService();
