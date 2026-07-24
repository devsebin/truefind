import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import mongoose, { HydratedDocument } from "mongoose";
import { IUpdateStatusPayloadStrict } from "../../payloads/create-status.payload";
import { IStatus } from "@/database/status/status-db-interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../statuses.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { statusErrorResponse } from "../../statuses.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class updateStatusHelperService {
  constructor() { }
  public async execute(
    id: mongoose.Types.ObjectId,
    payload: IUpdateStatusPayloadStrict,
    existing: HydratedDocument<IStatus>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IStatus>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = statusErrorResponse(existing);
        throwError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data,
            filler: { 0: existing.label, 1: existing._id },
          }),
        );
      }

      // Only update the fields that have changed
      existing.title = payload.title;
      existing.color = payload.color;
      existing.label = payload.label;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Status,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved as HydratedDocument<IStatus>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating district", errorMap);
    }
  }
}

export default new updateStatusHelperService();
