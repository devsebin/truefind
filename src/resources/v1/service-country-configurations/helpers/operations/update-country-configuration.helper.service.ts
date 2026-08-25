import { IServiceCountryConfigurationDocument } from "@/database/service-country-configuration/service-country-configuration.interface";
import mongoose, { HydratedDocument } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwCountryConfigError } from "../../service-country-configurations.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class UpdateCountryConfigurationHelperService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: any,
    existing: HydratedDocument<IServiceCountryConfigurationDocument>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceCountryConfigurationDocument>> {
    try {
      const snapshot = existing.toObject();

      const fieldsToUpdate = [
        "required_licenses",
        "is_callout_service",
        "is_fixed_price",
        "currency_id",
        "price",
        "unit_id",
        "minimum_unit_price",
        "maximum_unit_price",
        "call_out_fee",
        "estimated_time",
        "estimated_time_unit",
        "is_active"
      ];

      let changedCount = 0;
      fieldsToUpdate.forEach((field) => {
        if (payload[field] !== undefined && payload[field] !== (existing as any)[field]) {
          (existing as any)[field] = payload[field];
          changedCount++;
        }
      });

      if (changedCount === 0) {
        throwCountryConfigError(
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
          tableName.ServiceCountryConfigurations,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating country configuration", errorMap);
    }
  }
}

export default new UpdateCountryConfigurationHelperService();
