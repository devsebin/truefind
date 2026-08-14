import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { currenciesPayload, populateFields } from "../currencies.helper";
import { currenciesErrorsMessages } from "../currencies.messages";
import findCurrencyHelperService from "../helpers/validators/find-currencies.helper.service";
import updateCurrencyHelperService from "../helpers/operations/update-currencies.helper.service";
import { currencyResponse } from "../currencies.response";

class UpdateCurrenciesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request
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

      const saved = await updateCurrencyHelperService.execute(
        id,
        request.body,
        existing,
        session,
        dbTransactions,
        currenciesErrorsMessages
      );

      await saved.populate(populateFields);

      await session.commitTransaction();

      return currenciesPayload(
        "currency_updated",
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

export default new UpdateCurrenciesService();
