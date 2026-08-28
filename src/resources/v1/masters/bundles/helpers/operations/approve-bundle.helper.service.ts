import { IBundleDocument } from "@/database/bundles/bundles-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../bundles.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { bundleErrorResponse } from "../../bundles.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { getActiveBundleStatusId, getClearedBundleStatusId } from "@/utils/plugins/bundle-status.plugin";
import BundleServiceItemModel from "@/database/bundle-service-items/bundle-service-items-db-model";

class ApproveBundleHelperService {
  public async execute(
    existing: HydratedDocument<IBundleDocument>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleDocument>> {
    try {
      if (existing.is_deleted) {
        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Bundle is deleted",
            data: bundleErrorResponse(existing),
            filler: { 0: existing.code, 1: existing._id },
          }),
        );
      }

      // Check if bundle has any active service items
      const activeServiceCount = await BundleServiceItemModel.countDocuments({
        bundle_id: existing._id,
        is_active: true,
        is_deleted: false,
      }).session(session);

      if (activeServiceCount === 0) {
        throwError(
          "bundle_not_approvable",
          ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
            message: "Bundle has no active services and cannot be approved",
            data: bundleErrorResponse(existing),
            filler: { 0: existing.code, 1: existing._id },
          }),
        );
      }

      const activeStatusId = await getActiveBundleStatusId();
      const clearedStatusId = await getClearedBundleStatusId();

      // Check if already approved & active
      if (
        existing.is_active &&
        existing.status_id &&
        existing.status_id.toString() === activeStatusId.toString()
      ) {
        throwError(
          "already_approved",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Bundle is already approved",
            data: bundleErrorResponse(existing),
            filler: { 0: existing.code, 1: existing._id },
          }),
        );
      }

      if (
        existing.status_id.toString() !== clearedStatusId.toString()
      ) {
        throwError(
          "bundle_not_approvable",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Bundle is not in cleared status to be approved",
            data: bundleErrorResponse(existing),
            filler: { 0: existing.code, 1: existing._id },
          }),
        );
      }

      existing.status_id = activeStatusId;
      existing.is_active = true;
      existing.is_deleted = false;
      existing.deleted_at = undefined;
      existing.deleted_by = undefined;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Bundles,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<IBundleDocument>;
    } catch (error) {
      rethrowIfKnown(error, "Error while approving bundle", errorMap);
    }
  }
}

export default new ApproveBundleHelperService();
