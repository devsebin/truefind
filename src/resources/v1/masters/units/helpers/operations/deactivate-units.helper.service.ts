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

class deactivateUnitsHelperService {
  constructor() { }

  public async execute(
    existing: HydratedDocument<IUnits>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IUnits>> {
    try {
      if (!existing.is_active || existing.is_deleted) {
        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Unit is already inactive",
            data: unitsErrorResponse(existing),
            filler: { 0: existing.title, 1: existing._id },
          }),
        );
      }

      existing.is_active = false;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Units,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<IUnits>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deactivating unit", errorMap);
    }
  }
}

export default new deactivateUnitsHelperService();
