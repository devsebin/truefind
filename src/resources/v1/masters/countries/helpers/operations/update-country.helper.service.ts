import ICountry from "@/database/countries/countries-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { IUpdateICountryPayloadStrict } from "../../payloads/country-payload";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../countries.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { countryErrorResponse } from "../../countries.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class updateCountryHelperService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: IUpdateICountryPayloadStrict,
    existing: HydratedDocument<ICountry>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<ICountry>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = countryErrorResponse(existing);
        throwError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data,
            filler: { 0: existing.name, 1: existing._id },
          }),
        );
      }

      existing.name = payload.name;
      existing.iso_code = payload.iso_code;
      existing.iso_code_3 = payload.iso_code_3;
      existing.phone_code = payload.phone_code;
      existing.currency = payload.currency;
      existing.continent = payload.continent;
      existing.timezone = payload.timezone;
      if (payload.region_ids) {
        existing.region_ids = payload.region_ids.map(rid => new mongoose.Types.ObjectId(rid));
      }
      if (payload.flags) {
        existing.flags = new mongoose.Types.ObjectId(payload.flags);
      }

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Countries,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved as HydratedDocument<ICountry>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating country", errorMap);
    }
  }
}

export default new updateCountryHelperService();
