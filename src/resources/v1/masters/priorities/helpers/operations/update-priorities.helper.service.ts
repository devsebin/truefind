import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import mongoose, { HydratedDocument } from "mongoose";
import { IInputIPrioritiesPayloadStrict } from "../../payloads/priorities-payload";
import { IStatus } from "@/database/priorities/priorities-db-interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../priorities.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { prioritiesErrorResponse } from "../../priorities.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class updatePrioritiesHelperService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: Partial<IInputIPrioritiesPayloadStrict>,
    existing: HydratedDocument<IStatus>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IStatus>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = prioritiesErrorResponse(existing);
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
      if (payload.color !== undefined) existing.color = payload.color;
      if (payload.is_default !== undefined) existing.is_default = payload.is_default;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Priorities,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved as HydratedDocument<IStatus>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating priority", errorMap);
    }
  }
}

export default new updatePrioritiesHelperService();
