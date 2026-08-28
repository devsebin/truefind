import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import BundleServiceItemModel from "@/database/bundle-service-items/bundle-service-items-db-model";
import { bundlesErrorsMessages } from "../bundles.messages";
import findBundlesHelperService from "../helpers/validators/find-bundles.helper.service";
import { populateFields, bundlesPayload } from "../bundles.helper";
import { bundleResponse } from "../bundles.response";

class showBundlesService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];

    try {
      const bundle = await findBundlesHelperService.execute(
        { _id: id },
        bundlesErrorsMessages,
        {
          lean: true,
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
        },
      );

      const bundleServiceItems = await BundleServiceItemModel.find({
        bundle_id: id,
        is_deleted: false,
      })
        .populate({
          path: "service_id",
          select: "name code description icon status_id is_active is_deleted",
        })
        .sort({ sort_order: 1, createdAt: 1 })
        .lean();

      return bundlesPayload(
        "bundle_fetched",
        bundleResponse(bundle[0], bundleServiceItems),
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        bundlesErrorsMessages,
        err.data,
      );
    }
  }
}

export default new showBundlesService();
