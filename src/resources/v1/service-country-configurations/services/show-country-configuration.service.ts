import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { returnCountryConfigSuccess, populateFields } from "../service-country-configurations.helper";
import { serviceCountryConfigErrorsMessages } from "../service-country-configurations.messages";
import findServiceCountryHelperService from "../helpers/validators/find-service-country.helper.service";
import { serviceCountryConfigResponse } from "../service-country-configurations.response";

class ShowCountryConfigurationService {
  public async execute(
    id: mongoose.Types.ObjectId
  ): Promise<SingleResponse | ErrorResponse> {
    try {
      const configs = await findServiceCountryHelperService.execute(
        { _id: id },
        serviceCountryConfigErrorsMessages,
        {
          throwIfNotFound: true,
          populate: populateFields,
        }
      );

      return returnCountryConfigSuccess("country_config_fetched", serviceCountryConfigResponse(configs[0]));
    } catch (error) {
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceCountryConfigErrorsMessages, err.data);
    }
  }
}

export default new ShowCountryConfigurationService();
