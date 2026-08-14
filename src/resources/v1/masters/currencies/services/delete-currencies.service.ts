import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { currenciesPayload } from "../currencies.helper";
import { currenciesErrorsMessages } from "../currencies.messages";
import findCurrencyHelperService from "../helpers/validators/find-currencies.helper.service";
import deleteCurrencyHelperService from "../helpers/operations/delete-currencies.helper.service";
import { currencyResponse } from "../currencies.response";

class DeleteCurrenciesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    force: boolean
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const currencies = await findCurrencyHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        currenciesErrorsMessages,
        {
          throwIfNotFound: true,
          session,
        }
      );

      const existing = currencies[0];

      const saved = await deleteCurrencyHelperService.execute(
        existing,
        session,
        userId,
        force,
        dbTransactions,
        currenciesErrorsMessages
      );

      await session.commitTransaction();

      return currenciesPayload(
        "currency_deleted",
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

export default new DeleteCurrenciesService();
