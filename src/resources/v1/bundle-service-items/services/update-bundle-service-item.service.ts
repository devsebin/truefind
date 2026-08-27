import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  returnBundleServiceItemSuccess,
  populateFields,
} from "../bundle-service-items.helper";
import { bundleServiceItemErrorsMessages } from "../bundle-service-items.messages";
import findBundleServiceItemHelperService from "../helpers/validators/find-bundle-service-item.helper.service";
import updateBundleServiceItemHelperService from "../helpers/operations/update-bundle-service-item.helper.service";
import syncBundleStatusHelperService from "../helpers/operations/sync-bundle-status.helper.service";
import { bundleServiceItemResponse } from "../bundle-service-items.response";

import findBundlesHelperService from "@/resources/v1/masters/bundles/helpers/validators/find-bundles.helper.service";
import findServiceHelperService from "@/resources/v1/masters/services/helpers/validators/find-service.helper.service";
import { bundlesErrorsMessages } from "@/resources/v1/masters/bundles/bundles.messages";
import { servicesErrorsMessages } from "@/resources/v1/masters/services/services.messages";

class UpdateBundleServiceItemService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
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

      // Check bundle if provided
      if (request.body.bundle_id) {
        await findBundlesHelperService.execute(
          { _id: request.body.bundle_id, is_deleted: false } as any,
          bundlesErrorsMessages,
          {
            throwIfNotFound: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      // Check service if provided
      let targetService: any;
      if (request.body.service_id) {
        targetService = await findServiceHelperService.findOne(
          { _id: request.body.service_id, is_deleted: false, is_active: true },
          session,
        );
        if (!targetService) {
          throw new Error("service_not_found");
        }
      }

      // Check uniqueness if bundle_id or service_id changes
      const targetBundleId = request.body.bundle_id || existing.bundle_id;
      const targetServiceId = request.body.service_id || existing.service_id;

      if (request.body.bundle_id || request.body.service_id) {
        await findBundleServiceItemHelperService.execute(
          {
            _id: { $ne: id },
            bundle_id: targetBundleId,
            service_id: targetServiceId,
            is_deleted: false,
          } as any,
          bundleServiceItemErrorsMessages,
          {
            throwIfExists: true,
            returnDocument: false,
            session,
          },
        );
      }

      const payload = {
        ...request.body,
        updated_by: request.user?._id,
      };

      if (targetService) {
        if (!payload.service_name_snapshot) {
          payload.service_name_snapshot = targetService.name;
        }
        if (!payload.service_code_snapshot) {
          payload.service_code_snapshot = (targetService as any).code || "";
        }
      }

      const previousBundleId = existing.bundle_id;

      const saved = await updateBundleServiceItemHelperService.execute(
        id,
        payload,
        existing,
        session,
        dbTransactions,
        bundleServiceItemErrorsMessages,
      );

      // Sync parent bundle status for target bundle
      await syncBundleStatusHelperService.execute(
        targetBundleId,
        session,
        dbTransactions,
        request.user?._id,
      );

      // If bundle_id changed, sync previous bundle as well
      if (
        previousBundleId &&
        previousBundleId.toString() !== targetBundleId.toString()
      ) {
        await syncBundleStatusHelperService.execute(
          previousBundleId,
          session,
          dbTransactions,
          request.user?._id,
        );
      }

      await saved.populate(populateFields);

      await session.commitTransaction();

      return returnBundleServiceItemSuccess(
        "bundle_service_item_updated",
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

export default new UpdateBundleServiceItemService();
