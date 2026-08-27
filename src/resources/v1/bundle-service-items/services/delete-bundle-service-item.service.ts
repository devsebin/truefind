import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { Request } from "express";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  returnBundleServiceItemSuccess,
  populateFields,
} from "../bundle-service-items.helper";
import { bundleServiceItemErrorsMessages } from "../bundle-service-items.messages";
import findBundleServiceItemHelperService from "../helpers/validators/find-bundle-service-item.helper.service";
import deleteBundleServiceItemHelperService from "../helpers/operations/delete-bundle-service-item.helper.service";
import syncBundleStatusHelperService from "../helpers/operations/sync-bundle-status.helper.service";
import { bundleServiceItemResponse } from "../bundle-service-items.response";

class DeleteBundleServiceItemService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request?: Request,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const items = await findBundleServiceItemHelperService.execute(
        { _id: id, is_deleted: false } as any,
        bundleServiceItemErrorsMessages,
        {
          throwIfNotFound: true,
          session,
        },
      );

      const existing = items[0];
      const bundleId = existing.bundle_id;

      const saved = await deleteBundleServiceItemHelperService.execute(
        existing,
        session,
        dbTransactions,
        bundleServiceItemErrorsMessages,
        request?.user?._id,
      );

      // Sync parent bundle status
      await syncBundleStatusHelperService.execute(
        bundleId,
        session,
        dbTransactions,
        request?.user?._id,
      );

      await saved.populate(populateFields);

      await session.commitTransaction();

      return returnBundleServiceItemSuccess(
        "bundle_service_item_deleted",
        bundleServiceItemResponse(saved),
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(
        err.message,
        bundleServiceItemErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new DeleteBundleServiceItemService();
