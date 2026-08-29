import { IBundleAreaConfigurationDocument } from "@/database/bundle-area-configuration/bundle-area-configuration-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwBundleAreaConfigError } from "../../bundle-area-configurations.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class UpdateBundleAreaHelperService {
  constructor() {}

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: any,
    existing: HydratedDocument<IBundleAreaConfigurationDocument>,
    userId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleAreaConfigurationDocument>> {
    try {
      const snapshot = existing.toObject();

      const fieldsToUpdate = [
        "is_callout_bundle",
        "is_fixed_price",
        "price",
        "unit_id",
        "currency_id",
        "minimum_price",
        "maximum_price",
        "call_out_fee",
        "estimated_time",
        "estimated_time_unit",
        "individual_services_total",
        "bundle_discount_type",
        "bundle_discount_value",
        "is_active",
        "status_id",
      ];

      let changedCount = 0;
      fieldsToUpdate.forEach((field) => {
        if (payload[field] !== undefined) {
          const currentVal = (existing as any)[field];
          const newVal = payload[field];

          const isDiff =
            currentVal instanceof mongoose.Types.ObjectId ||
            newVal instanceof mongoose.Types.ObjectId
              ? currentVal?.toString() !== newVal?.toString()
              : currentVal !== newVal;

          if (isDiff) {
            (existing as any)[field] = newVal;
            changedCount++;
          }
        }
      });


      if (changedCount === 0) {
        throwBundleAreaConfigError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data: { id },
          }),
        );
      }

      if (userId) {
        existing.updated_by = userId;
      }

      const saved = await existing.save({ session });
      const changes = updatedFields(saved.toObject(), snapshot);



      dbTransactions.push(
        await createDbTransaction(
          tableName.BundleAreaConfigurations,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while updating bundle area configuration",
        errorMap,
      );
    }
  }
}

export default new UpdateBundleAreaHelperService();
