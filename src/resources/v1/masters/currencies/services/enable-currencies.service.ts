import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { currenciesPayload, populateFields } from "../currencies.helper";
import { currenciesErrorsMessages } from "../currencies.messages";
import findCurrencyHelperService from "../helpers/validators/find-currencies.helper.service";
import activateCurrencyHelperService from "../helpers/operations/activate-currencies.helper.service";
import { currencyResponse } from "../currencies.response";

class EnableCurrenciesService {
  public async execute(
    id: mongoose.Types.ObjectId
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const currencies = await findCurrencyHelperService.execute(
        {
          _id: id,
          is_deleted: false,
          is_active: { $in: [true, false] },
        } as any,
        currenciesErrorsMessages,
        {
          throwIfNotFound: true,
          session,
        }
      );

      const existing = currencies[0];

      const saved = await activateCurrencyHelperService.execute(
        existing,
        session,
        dbTransactions,
        currenciesErrorsMessages
      );

      await saved.populate(populateFields);

      await session.commitTransaction();

      return currenciesPayload(
        "currency_enabled",
        currencyResponse(saved),
        dbTransactions
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, currenciesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new EnableCurrenciesService();
