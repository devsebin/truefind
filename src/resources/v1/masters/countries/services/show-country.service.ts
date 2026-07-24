import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { countryErrorsMessages } from "../countries.messages";
import findCountryHelperService from "../helpers/validators/find-country.helper.service";
import { populateFields, countryPayload } from "../countries.helper";
import { countryResponse } from "../countries.response";

class showCountryService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];

    try {
      const country = await findCountryHelperService.execute(
        { _id: id },
        countryErrorsMessages,
        {
          lean: true,
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
        },
      );

      return countryPayload(
        "country_fetched",
        countryResponse(country[0]),
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, countryErrorsMessages, err.data);
    }
  }
}

export default new showCountryService();
