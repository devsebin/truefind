import { IServiceAreaConfigurationDocument } from "@/database/service-area-configuration/service-area-configuration.interface";
import mongoose, { HydratedDocument } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwAreaConfigError } from "../../service-area-configurations.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class UpdateServiceAreaHelperService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: any,
    existing: HydratedDocument<IServiceAreaConfigurationDocument>,
    userId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceAreaConfigurationDocument>> {
    try {
      const snapshot = existing.toObject();

      const fieldsToUpdate = [
        "required_licenses",
        "is_callout_service",
        "is_fixed_price",
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
        throwAreaConfigError(
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
          tableName.ServiceAreaConfigurations,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating service area configuration", errorMap);
    }
  }
}

export default new UpdateServiceAreaHelperService();
