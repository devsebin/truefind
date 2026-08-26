import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { bundleStatusesErrorsMessages } from "../bundle-statuses.messages";
import findBundleStatusesHelperService from "../helpers/validators/find-bundle-statuses.helper.service";
import { populateFields, bundleStatusesPayload } from "../bundle-statuses.helper";
import { bundleStatusesResponse } from "../bundle-statuses.response";

class showBundleStatusesService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];

    try {
      const bundleStatus = await findBundleStatusesHelperService.execute(
        { _id: id },
        bundleStatusesErrorsMessages,
        {
          lean: true,
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
        },
      );

      return bundleStatusesPayload(
        "bundle_statuses_fetched",
        bundleStatusesResponse(bundleStatus[0]),
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        bundleStatusesErrorsMessages,
        err.data,
      );
    }
  }
}

export default new showBundleStatusesService();
