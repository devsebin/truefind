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

class activateServiceStatusesHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IServiceStatus>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceStatus>> {
    try {
      if (existing.is_active && !existing.is_deleted) {
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service status is already activated",
            data: serviceStatusesErrorResponse(existing),
            filler: { 0: existing.title, 1: existing._id },
          }),
        );
      }

      existing.is_active = true;
      existing.is_deleted = false;
      existing.deleted_at = undefined;
      existing.deleted_by = undefined;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceStatus,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<IServiceStatus>;
    } catch (error) {
      rethrowIfKnown(error, "Error while activating service status", errorMap);
    }
  }
}

export default new activateServiceStatusesHelperService();
