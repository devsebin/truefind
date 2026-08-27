import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { bundleLocationConfigStatusesErrorsMessages } from "../bundle-location-config-statuses.messages";
import findBundleLocationConfigStatusesHelperService from "../helpers/validators/find-bundle-location-config-statuses.helper.service";
import {
  populateFields,
  bundleLocationConfigStatusesPayload,
} from "../bundle-location-config-statuses.helper";
import { bundleLocationConfigStatusesResponse } from "../bundle-location-config-statuses.response";

class showBundleLocationConfigStatusesService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];

    try {
      const bundleLocationConfigStatus =
        await findBundleLocationConfigStatusesHelperService.execute(
          { _id: id },
          bundleLocationConfigStatusesErrorsMessages,
          {
            lean: true,
            throwIfNotFound: true,
            returnDocument: true,
            populate: populateFields,
          },
        );

      return bundleLocationConfigStatusesPayload(
        "bundle_location_config_statuses_fetched",
        bundleLocationConfigStatusesResponse(bundleLocationConfigStatus[0]),
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        bundleLocationConfigStatusesErrorsMessages,
        err.data,
      );
    }
  }
}

export default new showBundleLocationConfigStatusesService();
