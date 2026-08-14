import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { currenciesPayload, populateFields } from "../currencies.helper";
import { currenciesErrorsMessages } from "../currencies.messages";
import findCurrencyHelperService from "../helpers/validators/find-currencies.helper.service";
import { currencyResponse } from "../currencies.response";

class ShowCurrenciesService {
  public async execute(
    id: mongoose.Types.ObjectId
  ): Promise<SingleResponse | ErrorResponse> {
    try {
      const currencies = await findCurrencyHelperService.execute(
        { _id: id },
        currenciesErrorsMessages,
        {
          throwIfNotFound: true,
          populate: populateFields,
        }
      );

      return currenciesPayload("currency_fetched", currencyResponse(currencies[0]));
    } catch (error) {
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, currenciesErrorsMessages, err.data);
    }
  }
}

export default new ShowCurrenciesService();
