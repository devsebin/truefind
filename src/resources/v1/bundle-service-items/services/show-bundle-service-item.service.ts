import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import mongoose from "mongoose";
import {
  returnBundleServiceItemSuccess,
  populateFields,
} from "../bundle-service-items.helper";
import { bundleServiceItemErrorsMessages } from "../bundle-service-items.messages";
import findBundleServiceItemHelperService from "../helpers/validators/find-bundle-service-item.helper.service";
import { bundleServiceItemResponse } from "../bundle-service-items.response";

class ShowBundleServiceItemService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    try {
      const items = await findBundleServiceItemHelperService.execute(
        { _id: id, is_deleted: false } as any,
        bundleServiceItemErrorsMessages,
        {
          throwIfNotFound: true,
          populate: populateFields,
        },
      );

      return returnBundleServiceItemSuccess(
        "bundle_service_item_fetched",
        bundleServiceItemResponse(items[0]),
      );
    } catch (error) {
      const err = error as Error & { data?: any };
      return buildErrorResult(
        err.message,
        bundleServiceItemErrorsMessages,
        err.data,
      );
    }
  }
}

export default new ShowBundleServiceItemService();
