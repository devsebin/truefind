import { ICurrency } from "@/database/currencies/currencies-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../currencies.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { currencyErrorResponse } from "../../currencies.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class UpdateCurrencyHelperService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: any,
    existing: HydratedDocument<ICurrency>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<ICurrency>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = currencyErrorResponse(existing);
        throwError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data,
          }),
        );
      }

      if (payload.title !== undefined) existing.title = payload.title;
      if (payload.label !== undefined) existing.label = payload.label;
      if (payload.code !== undefined) existing.code = payload.code;
      if (payload.symbol !== undefined) existing.symbol = new mongoose.Types.ObjectId(payload.symbol);

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Currencies,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved as HydratedDocument<ICurrency>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating currency", errorMap);
    }
  }
}

export default new UpdateCurrencyHelperService();
