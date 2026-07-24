import IDistrict from "@/database/districts/districts-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../districts.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { districtErrorResponse } from "../../districts.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import RegionModel from "@/database/regions/regions-db-model";

class deleteDistrictHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IDistrict>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    force: boolean,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IDistrict>> {
    try {
      if (existing.is_deleted) {
        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "District is already deleted",
            data: districtErrorResponse(existing),
            filler: { 0: existing.name, 1: existing._id },
          }),
        );
      }

      if (existing.is_active && !force) {
        throwError(
          "confirmation_required",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Confirmation required to delete district",
            data: districtErrorResponse(existing),
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
          tableName.Districts,
          apiMethods.DELETE,
          operationTypes.Delete,
          saved,
        ),
      );

      // Remove the district ID from the associated region's district_ids list
      if (existing.region_id) {
        const region = await RegionModel.findByIdAndUpdate(
          existing.region_id,
          { $pull: { district_ids: existing._id } },
          { session },
        );

        if (region) {
          dbTransactions.push(
            await createDbTransaction(
              tableName.Regions,
              apiMethods.PUT,
              operationTypes.Update,
              region.toObject(),
            ),
          );
        }
      }

      return saved as HydratedDocument<IDistrict>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deleting district", errorMap);
    }
  }
}

export default new deleteDistrictHelperService();
