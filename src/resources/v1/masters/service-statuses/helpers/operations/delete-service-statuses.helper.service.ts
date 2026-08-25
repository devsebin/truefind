import { IServiceStatus } from "@/database/service-status/service-status-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../service-statuses.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { serviceStatusesErrorResponse } from "../../service-statuses.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class deleteServiceStatusesHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IServiceStatus>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    force: boolean,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceStatus>> {
    try {
      if (existing.is_deleted) {
        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service status is already deleted",
            data: serviceStatusesErrorResponse(existing),
            filler: { 0: existing.title, 1: existing._id },
          }),
        );
      }

      if (existing.is_active && !force) {
        throwError(
          "confirmation_required",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Confirmation required to delete service status",
            data: serviceStatusesErrorResponse(existing),
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
          tableName.ServiceStatus,
          apiMethods.DELETE,
          operationTypes.Delete,
          saved,
        ),
      );

      return saved as HydratedDocument<IServiceStatus>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deleting service status", errorMap);
    }
  }
}

export default new deleteServiceStatusesHelperService();
