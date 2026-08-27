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
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { bundleServiceItemListResponse } from "../bundle-service-items.response";

class ListBundleServiceItemService {
  public async execute(
    request: Request,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const { bundle_id, service_id, is_active, is_mandatory, is_included } =
        request.query;
      const query: any = { is_deleted: false };

      if (bundle_id) {
        query.bundle_id = new mongoose.Types.ObjectId(bundle_id as string);
      }
      if (service_id) {
        query.service_id = new mongoose.Types.ObjectId(service_id as string);
      }
      if (is_active !== undefined) {
        query.is_active = String(is_active) === "true";
      }
      if (is_mandatory !== undefined) {
        query.is_mandatory = String(is_mandatory) === "true";
      }
      if (is_included !== undefined) {
        query.is_included = String(is_included) === "true";
      }

      const items = await findBundleServiceItemHelperService.execute(
        query,
        bundleServiceItemErrorsMessages,
        {
          populate: populateFields,
          sort: { sort_order: 1, createdAt: -1 },
          session,
        },
      );

      dbTransactions.push(
        await createDbTransaction(
          tableName.BundleServiceItems,
          apiMethods.GET,
          operationTypes.Read,
          items,
        ),
      );

      await session.commitTransaction();

      return returnBundleServiceItemSuccess(
        "bundle_service_item_fetched",
        bundleServiceItemListResponse(items),
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

export default new ListBundleServiceItemService();
