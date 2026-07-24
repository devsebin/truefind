import IDistrict from "@/database/districts/districts-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { IUpdateDistrictPayloadStrict } from "../../payloads/create-district.payload";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../districts.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { districtErrorResponse } from "../../districts.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import RegionModel from "@/database/regions/regions-db-model";

class updateDistrictHelperService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: IUpdateDistrictPayloadStrict,
    existing: HydratedDocument<IDistrict>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IDistrict>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = districtErrorResponse(existing);
        throwError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data,
            filler: { 0: existing.name, 1: existing._id },
          }),
        );
      }

      const oldRegionId = existing.region_id ? existing.region_id.toString() : null;
      const newRegionId = payload.region_id ? payload.region_id.toString() : null;

      existing.name = payload.name;
      existing.code = payload.code.toUpperCase();
      existing.country_id = payload.country_id ? new mongoose.Types.ObjectId(payload.country_id) : undefined as any;
      existing.region_id = payload.region_id ? new mongoose.Types.ObjectId(payload.region_id) : undefined as any;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Districts,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      // If the district's region changed, remove from old region's district_ids and add to new region's district_ids
      if (oldRegionId !== newRegionId) {
        if (oldRegionId) {
          const oldRegion = await RegionModel.findByIdAndUpdate(
            oldRegionId,
            { $pull: { district_ids: existing._id } },
            { session },
          );

          if (oldRegion) {
            dbTransactions.push(
              await createDbTransaction(
                tableName.Regions,
                apiMethods.PUT,
                operationTypes.Update,
                oldRegion.toObject(),
              ),
            );
          }
        }

        if (newRegionId) {
          const newRegion = await RegionModel.findByIdAndUpdate(
            newRegionId,
            { $push: { district_ids: existing._id } },
            { session },
          );

          if (newRegion) {
            dbTransactions.push(
              await createDbTransaction(
                tableName.Regions,
                apiMethods.PUT,
                operationTypes.Update,
                newRegion.toObject(),
              ),
            );
          }
        }
      }

      return saved as HydratedDocument<IDistrict>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating district", errorMap);
    }
  }
}

export default new updateDistrictHelperService();
