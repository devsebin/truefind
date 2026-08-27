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
import createBundleServiceItemHelperService from "../helpers/operations/create-bundle-service-item.helper.service";
import syncBundleStatusHelperService from "../helpers/operations/sync-bundle-status.helper.service";
import { toBundleServiceItemDTO } from "../dto/bundle-service-item.dto";
import { bundleServiceItemResponse } from "../bundle-service-items.response";

import findBundlesHelperService from "@/resources/v1/masters/bundles/helpers/validators/find-bundles.helper.service";
import findServiceHelperService from "@/resources/v1/masters/services/helpers/validators/find-service.helper.service";
import { bundlesErrorsMessages } from "@/resources/v1/masters/bundles/bundles.messages";
import { servicesErrorsMessages } from "@/resources/v1/masters/services/services.messages";

class CreateBundleServiceItemService {
  public async execute(
    request: Request,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = toBundleServiceItemDTO(request.body);

    try {
      session.startTransaction();

      // Check bundle exists and active
      await findBundlesHelperService.execute(
        { _id: body.bundle_id, is_deleted: false } as any,
        bundlesErrorsMessages,
        {
          throwIfNotFound: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      // Check service exists and active
      const targetService = await findServiceHelperService.findOne(
        { _id: body.service_id, is_deleted: false, is_active: true },
        session,
      );

      if (!targetService) {
        throw new Error("service_not_found");
      }

      // Check unique (bundle_id + service_id)
      await findBundleServiceItemHelperService.execute(
        {
          bundle_id: body.bundle_id,
          service_id: body.service_id,
          is_deleted: false,
        } as any,
        bundleServiceItemErrorsMessages,
        {
          throwIfExists: true,
          returnDocument: false,
          session,
        },
      );

      // Prepare payload snapshot
      const createPayload: any = {
        ...body,
        service_name_snapshot:
          body.service_name_snapshot || targetService?.name,
        service_code_snapshot:
          body.service_code_snapshot || (targetService as any)?.code || "",
        created_by: request.user?._id,
        updated_by: request.user?._id,
      };

      const newItem = await createBundleServiceItemHelperService.execute(
        createPayload,
        session,
        dbTransactions,
        bundleServiceItemErrorsMessages,
      );

      // Sync parent bundle status
      await syncBundleStatusHelperService.execute(
        body.bundle_id,
        session,
        dbTransactions,
        request.user?._id,
      );

      await newItem.populate(populateFields);

      await session.commitTransaction();

      return returnBundleServiceItemSuccess(
        "bundle_service_item_created",
        bundleServiceItemResponse(newItem),
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

export default new CreateBundleServiceItemService();
