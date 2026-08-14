import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { returnCountryConfigSuccess, populateFields } from "../service-country-configurations.helper";
import { serviceCountryConfigErrorsMessages } from "../service-country-configurations.messages";
import findServiceCountryHelperService from "../helpers/validators/find-service-country.helper.service";
import deleteCountryConfigurationHelperService from "../helpers/operations/delete-country-configuration.helper.service";
import { serviceCountryConfigResponse } from "../service-country-configurations.response";

class DeleteCountryConfigurationService {
  public async execute(
    id: mongoose.Types.ObjectId
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const configs = await findServiceCountryHelperService.execute(
        { _id: id },
        serviceCountryConfigErrorsMessages,
        {
          throwIfNotFound: true,
          session,
        }
      );

      const existing = configs[0];

      const saved = await deleteCountryConfigurationHelperService.execute(
        existing,
        session,
        dbTransactions,
        serviceCountryConfigErrorsMessages
      );

      await saved.populate(populateFields);

      await session.commitTransaction();

      return returnCountryConfigSuccess(
        "country_config_deleted",
        serviceCountryConfigResponse(saved),
        dbTransactions
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceCountryConfigErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new DeleteCountryConfigurationService();
