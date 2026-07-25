import ISuburb from "@/database/suburbs/suburbs-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { IUpdateSuburbPayloadStrict } from "../../payloads/create-suburb.payload";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../suburbs.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { suburbErrorResponse } from "../../suburbs.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import DistrictModel from "@/database/districts/districts-db-model";
import { toUpdateSuburbDTO } from "../../dto/suburb.dto";

class updateSuburbHelperService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: IUpdateSuburbPayloadStrict,
    existing: HydratedDocument<ISuburb>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<ISuburb>> {
    try {
      const dto = toUpdateSuburbDTO(payload);
      const changes = updatedFields(dto, existing);
      if (changes.length === 0) {
        const data = suburbErrorResponse(existing);
        throwError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data,
            filler: { 0: existing.name, 1: existing._id },
          }),
        );
      }

      const oldDistrictId = existing.district_id ? existing.district_id.toString() : null;
      const newDistrictId = dto.district_id ? dto.district_id.toString() : null;

      if (dto.name !== undefined) existing.name = dto.name;
      if (dto.code !== undefined) existing.code = dto.code;
      if (dto.country_id !== undefined) existing.country_id = dto.country_id;
      if (dto.region_id !== undefined) existing.region_id = dto.region_id;
      if (dto.district_id !== undefined) existing.district_id = dto.district_id;
      if (dto.post_code !== undefined) existing.post_code = dto.post_code;
      if (dto.location !== undefined) existing.location = dto.location;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Suburbs,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      // If the suburb's district changed, remove from old district's suburb_ids and add to new district's suburb_ids
      if (oldDistrictId !== newDistrictId && newDistrictId !== null) {
        if (oldDistrictId) {
          const oldDistrict = await DistrictModel.findByIdAndUpdate(
            oldDistrictId,
            { $pull: { suburb_ids: existing._id } },
            { session },
          );

          if (oldDistrict) {
            dbTransactions.push(
              await createDbTransaction(
                tableName.Districts,
                apiMethods.PUT,
                operationTypes.Update,
                oldDistrict.toObject(),
              ),
            );
          }
        }

        if (newDistrictId) {
          const newDistrict = await DistrictModel.findByIdAndUpdate(
            newDistrictId,
            { $push: { suburb_ids: existing._id } },
            { session },
          );

          if (newDistrict) {
            dbTransactions.push(
              await createDbTransaction(
                tableName.Districts,
                apiMethods.PUT,
                operationTypes.Update,
                newDistrict.toObject(),
              ),
            );
          }
        }
      }

      return saved as HydratedDocument<ISuburb>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating suburb", errorMap);
    }
  }
}

export default new updateSuburbHelperService();
