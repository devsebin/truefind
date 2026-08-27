import { IBundleServiceItem } from "@/database/bundle-service-items/bundle-service-items-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwBundleServiceItemError } from "../../bundle-service-items.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class DeleteBundleServiceItemHelperService {
  public async execute(
    existing: HydratedDocument<IBundleServiceItem>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
    userId?: mongoose.Types.ObjectId,
  ): Promise<HydratedDocument<IBundleServiceItem>> {
    try {
      if (existing.is_deleted) {
        throwBundleServiceItemError(
          "something_went_wrong",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Bundle service item already deleted",
            data: { id: existing._id },
          }),
        );
      }

      existing.is_deleted = true;
      existing.is_active = false;
      existing.deleted_at = new Date();
      if (userId) {
        existing.deleted_by = userId as any;
      }

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.BundleServiceItems,
          apiMethods.DELETE,
          operationTypes.Delete,
          saved.toObject(),
        ),
      );

      return saved;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while deleting bundle service item",
        errorMap,
      );
    }
  }
}

export default new DeleteBundleServiceItemHelperService();
