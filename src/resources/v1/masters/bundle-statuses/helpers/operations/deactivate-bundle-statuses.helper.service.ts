import { IBundleStatus } from "@/database/bundle-statuses/bundle-statuses-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../bundle-statuses.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { bundleStatusesErrorResponse } from "../../bundle-statuses.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class deactivateBundleStatusesHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IBundleStatus>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleStatus>> {
    try {
      if (!existing.is_active || existing.is_deleted) {
        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Bundle status is already inactive",
            data: bundleStatusesErrorResponse(existing),
            filler: { 0: existing.title, 1: existing._id },
          }),
        );
      }

      existing.is_active = false;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.BundleStatuses,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<IBundleStatus>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deactivating bundle status", errorMap);
    }
  }
}

export default new deactivateBundleStatusesHelperService();
