import IStatus from "@/database/priorities/priorities-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../priorities.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { prioritiesErrorResponse } from "../../priorities.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class deactivatePrioritiesHelperService {
  constructor() { }

  public async execute(
    existing: HydratedDocument<IStatus>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IStatus>> {
    try {
      if (!existing.is_active || existing.is_deleted) {
        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Priority is already inactive",
            data: prioritiesErrorResponse(existing),
            filler: { 0: existing.title, 1: existing._id },
          }),
        );
      }

      existing.is_active = false;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Priorities,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<IStatus>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deactivating priority", errorMap);
    }
  }
}

export default new deactivatePrioritiesHelperService();
