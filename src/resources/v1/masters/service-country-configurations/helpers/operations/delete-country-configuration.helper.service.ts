import { IServiceCountryConfigurationDocument } from "@/database/service-country-configuration/service-country-configuration.interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwCountryConfigError } from "../../service-country-configurations.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class DeleteCountryConfigurationHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IServiceCountryConfigurationDocument>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceCountryConfigurationDocument>> {
    try {
      if (existing.is_deleted) {
        throwCountryConfigError(
          "something_went_wrong",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Country configuration already deleted",
            data: { id: existing._id },
          }),
        );
      }

      existing.is_deleted = true;
      existing.is_active = false;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceCountryConfigurations,
          apiMethods.DELETE,
          operationTypes.Delete,
          saved.toObject(),
        ),
      );

      return saved;
    } catch (error) {
      rethrowIfKnown(error, "Error while deleting country configuration", errorMap);
    }
  }
}

export default new DeleteCountryConfigurationHelperService();
