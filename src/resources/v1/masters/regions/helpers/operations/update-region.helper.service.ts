import { IRegion } from "@/database/regions/regions-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { IUpdateRegionPayloadStrict } from "../../payloads/create-region.payload";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../regions.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { regionErrorResponse } from "../../regions.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import CountryModel from "@/database/countries/countries-db-model";

class updateRegionHelperService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: IUpdateRegionPayloadStrict,
    existing: HydratedDocument<IRegion>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IRegion>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = regionErrorResponse(existing);
        throwError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data,
            filler: { 0: existing.name, 1: existing._id },
          }),
        );
      }

      const oldCountryId = existing.country_id ? existing.country_id.toString() : null;
      const newCountryId = payload.country_id ? payload.country_id.toString() : null;

      existing.name = payload.name;
      existing.code = payload.code;
      existing.country_id = payload.country_id ? new mongoose.Types.ObjectId(payload.country_id) : undefined as any;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Regions,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      // If the region's country changed, remove from old country's region_ids and add to new country's region_ids
      if (oldCountryId !== newCountryId) {
        if (oldCountryId) {
          const oldCountry = await CountryModel.findByIdAndUpdate(
            oldCountryId,
            { $pull: { region_ids: existing._id } },
            { session },
          );

          if (oldCountry) {
            dbTransactions.push(
              await createDbTransaction(
                tableName.Countries,
                apiMethods.PUT,
                operationTypes.Update,
                oldCountry.toObject(),
              ),
            );
          }
        }

        if (newCountryId) {
          const newCountry = await CountryModel.findByIdAndUpdate(
            newCountryId,
            { $push: { region_ids: existing._id } },
            { session },
          );

          if (newCountry) {
            dbTransactions.push(
              await createDbTransaction(
                tableName.Countries,
                apiMethods.PUT,
                operationTypes.Update,
                newCountry.toObject(),
              ),
            );
          }
        }
      }

      return saved as HydratedDocument<IRegion>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating region", errorMap);
    }
  }
}

export default new updateRegionHelperService();
