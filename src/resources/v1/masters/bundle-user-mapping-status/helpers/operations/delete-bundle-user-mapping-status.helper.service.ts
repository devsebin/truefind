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

class deleteBundleUserMappingStatusHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IBundleUserMappingStatus>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    force: boolean,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleUserMappingStatus>> {
    try {
      if (existing.is_deleted) {
        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Bundle user mapping status is already deleted",
            data: bundleUserMappingStatusErrorResponse(existing),
            filler: { 0: existing.title, 1: existing._id },
          }),
        );
      }

      if (existing.is_active && !force) {
        throwError(
          "confirmation_required",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Confirmation required to delete bundle user mapping status",
            data: bundleUserMappingStatusErrorResponse(existing),
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
          tableName.BundleUserMappingStatuses,
          apiMethods.DELETE,
          operationTypes.Delete,
          saved,
        ),
      );

      return saved as HydratedDocument<IBundleUserMappingStatus>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deleting bundle user mapping status", errorMap);
    }
  }
}

export default new deleteBundleUserMappingStatusHelperService();
