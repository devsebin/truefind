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

class deactivateRegionHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IRegion>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IRegion>> {
    try {
      if (!existing.is_active || existing.is_deleted) {
        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Region is already inactive",
            data: regionErrorResponse(existing),
            filler: { 0: existing.name, 1: existing._id },
          }),
        );
      }

      existing.is_active = false;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Regions,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<IRegion>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deactivating region", errorMap);
    }
  }
}

export default new deactivateRegionHelperService();
