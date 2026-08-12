import IUnits from "@/database/units/units-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../units.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { unitsErrorResponse } from "../../units.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class deleteUnitsHelperService {
  constructor() { }

  public async execute(
    existing: HydratedDocument<IUnits>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    force: boolean,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IUnits>> {
    try {
      if (existing.is_deleted) {
        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Unit is already deleted",
            data: unitsErrorResponse(existing),
            filler: { 0: existing.title, 1: existing._id },
          }),
        );
      }

      if (existing.is_active && !force) {
        throwError(
          "confirmation_required",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Confirmation required to delete unit",
            data: unitsErrorResponse(existing),
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
          tableName.Units,
          apiMethods.DELETE,
          operationTypes.Delete,
          saved,
        ),
      );

      return saved as HydratedDocument<IUnits>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deleting unit", errorMap);
    }
  }
}

export default new deleteUnitsHelperService();
