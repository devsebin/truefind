import ISuburb from "@/database/suburbs/suburbs-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../suburbs.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { suburbErrorResponse } from "../../suburbs.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import DistrictModel from "@/database/districts/districts-db-model";

class enableSuburbHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<ISuburb>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<ISuburb>> {
    try {
      if (existing.is_active || existing.is_deleted) {
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Suburb is already active",
            data: suburbErrorResponse(existing),
            filler: { 0: existing.name, 1: existing._id },
          }),
        );
      }

      existing.is_active = true;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Suburbs,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      // Add the suburb ID to the associated district's suburb_ids list
      if (existing.district_id) {
        const district = await DistrictModel.findByIdAndUpdate(
          existing.district_id,
          { $addToSet: { suburb_ids: existing._id } },
          { session },
        );

        if (district) {
          dbTransactions.push(
            await createDbTransaction(
              tableName.Districts,
              apiMethods.PUT,
              operationTypes.Update,
              district.toObject(),
            ),
          );
        }
      }

      return saved as HydratedDocument<ISuburb>;
    } catch (error) {
      rethrowIfKnown(error, "Error while enabling suburb", errorMap);
    }
  }
}

export default new enableSuburbHelperService();
