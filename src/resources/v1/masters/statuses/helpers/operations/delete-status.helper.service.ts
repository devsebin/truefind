import { IStatus } from "@/database/status/status-db-interface";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { tableName } from "@/utils/definitions/constants/table-names";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { throwError } from "../../statuses.helper";
import { ActionTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { statusErrorResponse } from "../../statuses.response";

class deleteStatusHelperService {
  async execute(
    status: HydratedDocument<IStatus>,
    errorMap: Record<string, { message: string; status: number }>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    owner: mongoose.Types.ObjectId,
    is_force: boolean = false,
  ): Promise<void> {
    try {
      if (!is_force && status.is_active) {
        throwError(
          "confirmation_required",
          ResponseBuilder.actionRequired(
            ActionTypes.CONFIRM_DELETE,
            "Are you sure you want to delete this status?",
            true,
            statusErrorResponse(status),
          ),
        );
      }

      const snapshot = status;
      status.is_deleted = true;
      status.deleted_by = owner;
      status.updated_by = owner;
      status.is_active = false;
      await status.save({ session });

      const changes = updatedFields(status, snapshot);

      DbTransactions.push(
        await createDbTransaction(
          tableName.Status,
          apiMethods.DELETE,
          operationTypes.Delete,
          status.toObject(),
          changes,
        ),
      );
    } catch (error) {
      rethrowIfKnown(error, "Error while deleting status", errorMap);
    }
  }
}

export default new deleteStatusHelperService();
