import { IBundleUserMappingStatus } from "@/database/bundle-user-mapping-status/bundle-user-mapping-status-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../bundle-user-mapping-status.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { bundleUserMappingStatusErrorResponse } from "../../bundle-user-mapping-status.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class activateBundleUserMappingStatusHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IBundleUserMappingStatus>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleUserMappingStatus>> {
    try {
      if (existing.is_active && !existing.is_deleted) {
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Bundle user mapping status is already activated",
            data: bundleUserMappingStatusErrorResponse(existing),
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
          tableName.BundleUserMappingStatuses,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<IBundleUserMappingStatus>;
    } catch (error) {
      rethrowIfKnown(error, "Error while activating bundle user mapping status", errorMap);
    }
  }
}

export default new activateBundleUserMappingStatusHelperService();
