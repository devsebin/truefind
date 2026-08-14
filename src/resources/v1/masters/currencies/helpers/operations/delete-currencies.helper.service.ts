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

class DeleteCurrencyHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<ICurrency>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    force: boolean,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<ICurrency>> {
    try {
      if (existing.is_deleted) {
        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Currency is already deleted",
            data: currencyErrorResponse(existing),
          }),
        );
      }

      if (existing.is_active && !force) {
        throwError(
          "something_went_wrong",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Confirmation required to delete currency",
            data: currencyErrorResponse(existing),
          }),
        );
      }

      existing.is_deleted = true;
      existing.is_active = false;
      existing.deleted_by = userId;
      existing.deleted_at = new Date();

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Currencies,
          apiMethods.DELETE,
          operationTypes.Delete,
          saved,
        ),
      );

      return saved as HydratedDocument<ICurrency>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deleting currency", errorMap);
    }
  }
}

export default new DeleteCurrencyHelperService();
