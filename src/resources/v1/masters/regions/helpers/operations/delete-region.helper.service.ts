import { IRegion } from "@/database/regions/regions-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../regions.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { regionErrorResponse } from "../../regions.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import CountryModel from "@/database/countries/countries-db-model";

class deleteRegionHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IRegion>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    force: boolean,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IRegion>> {
    try {
      if (existing.is_deleted) {
        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Region is already deleted",
            data: regionErrorResponse(existing),
            filler: { 0: existing.name, 1: existing._id },
          }),
        );
      }

      if (existing.is_active && !force) {
        throwError(
          "confirmation_required",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Confirmation required to delete region",
            data: regionErrorResponse(existing),
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
          tableName.Regions,
          apiMethods.DELETE,
          operationTypes.Delete,
          saved,
        ),
      );

      // Remove the region ID from the associated country's region_ids list
      if (existing.country_id) {
        const country = await CountryModel.findByIdAndUpdate(
          existing.country_id,
          { $pull: { region_ids: existing._id } },
          { session },
        );

        if (country) {
          dbTransactions.push(
            await createDbTransaction(
              tableName.Countries,
              apiMethods.PUT,
              operationTypes.Update,
              country.toObject(),
            ),
          );
        }
      }

      return saved as HydratedDocument<IRegion>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deleting region", errorMap);
    }
  }
}

export default new deleteRegionHelperService();
