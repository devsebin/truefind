import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { currenciesPayload, populateFields } from "../currencies.helper";
import { currenciesErrorsMessages } from "../currencies.messages";
import findCurrencyHelperService from "../helpers/validators/find-currencies.helper.service";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { currencyListResponse } from "../currencies.response";

class ListCurrenciesService {
  public async execute(
    request: Request
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const query: any = {};
      if (request.query.code) {
        query.code = String(request.query.code).toUpperCase();
      }

      const currencies = await findCurrencyHelperService.execute(
        query,
        currenciesErrorsMessages,
        {
          populate: populateFields,
          session,
        }
      );

      dbTransactions.push(
        await createDbTransaction(
          tableName.Currencies,
          apiMethods.GET,
          operationTypes.Read,
          currencies
        )
      );

      await session.commitTransaction();

      return currenciesPayload(
        "currency_fetched",
        currencyListResponse(currencies),
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

export default new ListCurrenciesService();
