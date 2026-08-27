import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import mongoose from "mongoose";
import {
  returnBundleCountryConfigSuccess,
  populateFields,
} from "../bundle-country-configurations.helper";
import { bundleCountryConfigErrorsMessages } from "../bundle-country-configurations.messages";
import findBundleCountryHelperService from "../helpers/validators/find-bundle-country.helper.service";
import { bundleCountryConfigResponse } from "../bundle-country-configurations.response";

class ShowBundleCountryConfigurationService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    try {
      const configs = await findBundleCountryHelperService.execute(
        { _id: id },
        bundleCountryConfigErrorsMessages,
        {
          throwIfNotFound: true,
          populate: populateFields,
        },
      );

      return returnBundleCountryConfigSuccess(
        "country_config_fetched",
        bundleCountryConfigResponse(configs[0]),
      );
    } catch (error) {
      const err = error as Error & { data?: any };
      return buildErrorResult(
        err.message,
        bundleCountryConfigErrorsMessages,
        err.data,
      );
    }
  }
}

export default new ShowBundleCountryConfigurationService();
