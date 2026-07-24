import ICountry from "@/database/countries/countries-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../countries.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { countryErrorResponse } from "../../countries.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class activateCountryHelperService {
  constructor() { }

  public async execute(
    existing: HydratedDocument<ICountry>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<ICountry>> {
    try {
      if (existing.is_active && !existing.is_deleted) {
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Country is already activated",
            data: countryErrorResponse(existing),
            filler: { 0: existing.name, 1: existing._id },
          }),
        );
      }

      existing.is_active = true;
      existing.is_deleted = false;
      existing.deleted_at = undefined;
      existing.deleted_by = undefined;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Countries,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<ICountry>;
    } catch (error) {
      rethrowIfKnown(error, "Error while activating country", errorMap);
    }
  }
}

export default new activateCountryHelperService();
