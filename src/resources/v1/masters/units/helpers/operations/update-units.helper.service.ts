import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import mongoose, { HydratedDocument } from "mongoose";
import { IInputIUnitsPayloadStrict } from "../../payloads/units-payload";
import { IUnits } from "@/database/units/units-db-interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../units.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { unitsErrorResponse } from "../../units.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class updateUnitsHelperService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: Partial<IInputIUnitsPayloadStrict>,
    existing: HydratedDocument<IUnits>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IUnits>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = unitsErrorResponse(existing);
        throwError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data,
            filler: { 0: existing.label, 1: existing._id },
          }),
        );
      }

      if (payload.title !== undefined) existing.title = payload.title;
      if (payload.label !== undefined) existing.label = payload.label;
      if (payload.dimension !== undefined) existing.dimension = payload.dimension;
      if (payload.color !== undefined) existing.color = payload.color;
      if (payload.is_default !== undefined) existing.is_default = payload.is_default;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Units,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved as HydratedDocument<IUnits>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating unit", errorMap);
    }
  }
}

export default new updateUnitsHelperService();
