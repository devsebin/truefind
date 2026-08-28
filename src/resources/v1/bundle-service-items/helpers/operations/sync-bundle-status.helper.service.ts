import mongoose from "mongoose";
import BundleModel from "@/database/bundles/bundles-db-model";
import BundleServiceItemModel from "@/database/bundle-service-items/bundle-service-items-db-model";
import {
  getActiveBundleStatusId,
  getClearedBundleStatusId,
  getDefaultBundleStatusId,
} from "@/utils/plugins/bundle-status.plugin";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { updatedFields } from "@/utils/helpers/update-finder.helper";

class SyncBundleStatusHelperService {
  public async execute(
    bundleId: mongoose.Types.ObjectId,
    session: mongoose.ClientSession,
    dbTransactions?: DbTransaction[],
    userId?: mongoose.Types.ObjectId,
  ): Promise<void> {
    const bundle = await BundleModel.findOne({
      _id: bundleId,
      is_deleted: false,
    }).session(session);

    if (!bundle) return;

    const bundleSnapshot = bundle.toObject();

    // Count active and not-deleted services in this bundle
    const activeServiceCount = await BundleServiceItemModel.countDocuments({
      bundle_id: bundleId,
      is_active: true,
      is_deleted: false,
    }).session(session);

    if (activeServiceCount > 0) {
      // If at least one active service exists: status -> Active, is_active -> true
      const getClearedStatusId = await getClearedBundleStatusId();
      bundle.status_id = getClearedStatusId;
      bundle.is_active = true;
    } else {
      // If no active service exists (all disabled or deleted): status -> Draft, is_active -> false
      const draftStatusId = await getDefaultBundleStatusId();
      bundle.status_id = draftStatusId;
      bundle.is_active = false;
    }

    if (userId) {
      bundle.updated_by = userId as any;
    }

    const savedBundle = await bundle.save({ session });

    if (dbTransactions) {
      const changes = updatedFields(savedBundle.toObject(), bundleSnapshot);
      if (Object.keys(changes).length > 0) {
        dbTransactions.push(
          await createDbTransaction(
            tableName.Bundles,
            apiMethods.PATCH,
            operationTypes.Update,
            savedBundle.toObject(),
            changes,
          ),
        );
      }
    }
  }
}

export default new SyncBundleStatusHelperService();
