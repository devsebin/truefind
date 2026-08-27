import { IBundleLocationConfigStatus } from "@/database/bundle-location-config-status/bundle-location-config-status-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../bundle-location-config-statuses.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { bundleLocationConfigStatusesErrorResponse } from "../../bundle-location-config-statuses.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class activateBundleLocationConfigStatusesHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IBundleLocationConfigStatus>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleLocationConfigStatus>> {
    try {
      if (existing.is_active && !existing.is_deleted) {
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Bundle location config status is already activated",
            data: bundleLocationConfigStatusesErrorResponse(existing),
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
          tableName.BundleLocationConfigStatuses,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<IBundleLocationConfigStatus>;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while activating bundle location config status",
        errorMap,
      );
    }
  }
}

export default new activateBundleLocationConfigStatusesHelperService();
