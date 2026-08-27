import { IBundleCountryConfigurationDocument } from "@/database/bundle-country-configuration/bundle-country-configuration-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwBundleCountryConfigError } from "../../bundle-country-configurations.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class DeleteBundleCountryConfigurationHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IBundleCountryConfigurationDocument>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleCountryConfigurationDocument>> {
    try {
      if (existing.is_deleted) {
        throwBundleCountryConfigError(
          "something_went_wrong",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Bundle country configuration already deleted",
            data: { id: existing._id },
          }),
        );
      }

      existing.is_deleted = true;
      existing.is_active = false;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.BundleCountryConfigurations,
          apiMethods.DELETE,
          operationTypes.Delete,
          saved.toObject(),
        ),
      );

      return saved;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while deleting bundle country configuration",
        errorMap,
      );
    }
  }
}

export default new DeleteBundleCountryConfigurationHelperService();
