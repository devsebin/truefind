import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { currenciesPayload, populateFields } from "../currencies.helper";
import { currenciesErrorsMessages } from "../currencies.messages";
import findCurrencyHelperService from "../helpers/validators/find-currencies.helper.service";
import createCurrencyHelperService from "../helpers/operations/create-currencies.helper.service";
import { toCurrencyDTO } from "../dto/create-currencies.dto";
import { currencyResponse } from "../currencies.response";

class CreateCurrenciesService {
  public async execute(
    request: Request
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = toCurrencyDTO(request.body);

    try {
      session.startTransaction();

      await findCurrencyHelperService.execute(
        {
          code: body.code,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        currenciesErrorsMessages,
        {
          throwIfExists: true,
          returnDocument: false,
          session,
        }
      );

      const newCurrency = await createCurrencyHelperService.execute(
        body,
        session,
        dbTransactions,
        currenciesErrorsMessages
      );

      await newCurrency.populate(populateFields);

      await session.commitTransaction();

      return currenciesPayload(
        "currency_created",
        currencyResponse(newCurrency),
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

export default new CreateCurrenciesService();
