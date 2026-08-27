import { IBundleServiceItem } from "@/database/bundle-service-items/bundle-service-items-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwBundleServiceItemError } from "../../bundle-service-items.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class UpdateBundleServiceItemHelperService {
  public async execute(
    id: mongoose.Types.ObjectId,
    payload: any,
    existing: HydratedDocument<IBundleServiceItem>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleServiceItem>> {
    try {
      const snapshot = existing.toObject();

      const fieldsToUpdate = [
        "bundle_id",
        "service_id",
        "sort_order",
        "quantity",
        "is_mandatory",
        "is_included",
        "service_name_snapshot",
        "service_code_snapshot",
        "metadata",
        "is_active",
        "updated_by",
      ];

      let changedCount = 0;
      fieldsToUpdate.forEach((field) => {
        if (
          payload[field] !== undefined &&
          payload[field] !== (existing as any)[field]
        ) {
          (existing as any)[field] = payload[field];
          changedCount++;
        }
      });

      if (changedCount === 0) {
        throwBundleServiceItemError(
          "something_went_wrong",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data: { id },
          }),
        );
      }

      const saved = await existing.save({ session });
      const changes = updatedFields(saved.toObject(), snapshot);

      dbTransactions.push(
        await createDbTransaction(
          tableName.BundleServiceItems,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while updating bundle service item",
        errorMap,
      );
    }
  }
}

export default new UpdateBundleServiceItemHelperService();
