import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  returnBundleCountryConfigSuccess,
  populateFields,
} from "../bundle-country-configurations.helper";
import { bundleCountryConfigErrorsMessages } from "../bundle-country-configurations.messages";
import findBundleCountryHelperService from "../helpers/validators/find-bundle-country.helper.service";
import deleteBundleCountryConfigurationHelperService from "../helpers/operations/delete-bundle-country-configuration.helper.service";
import { bundleCountryConfigResponse } from "../bundle-country-configurations.response";

class DeleteBundleCountryConfigurationService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const configs = await findBundleCountryHelperService.execute(
        { _id: id },
        bundleCountryConfigErrorsMessages,
        {
          throwIfNotFound: true,
          session,
        },
      );

      const existing = configs[0];

      const saved =
        await deleteBundleCountryConfigurationHelperService.execute(
          existing,
          session,
          dbTransactions,
          bundleCountryConfigErrorsMessages,
        );

      await saved.populate(populateFields);

      await session.commitTransaction();

      return returnBundleCountryConfigSuccess(
        "country_config_deleted",
        bundleCountryConfigResponse(saved),
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(
        err.message,
        bundleCountryConfigErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new DeleteBundleCountryConfigurationService();
