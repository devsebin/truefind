import { ICurrency } from "@/database/currencies/currencies-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../currencies.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { currencyErrorResponse } from "../../currencies.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class DeactivateCurrencyHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<ICurrency>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<ICurrency>> {
    try {
      if (!existing.is_active) {
        throwError(
          "already_disabled",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Currency is already inactive",
            data: currencyErrorResponse(existing),
          }),
        );
      }

      existing.is_active = false;
      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Currencies,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<ICurrency>;
    } catch (error) {
      rethrowIfKnown(error, "Error while disabling currency", errorMap);
    }
  }
}

export default new DeactivateCurrencyHelperService();
