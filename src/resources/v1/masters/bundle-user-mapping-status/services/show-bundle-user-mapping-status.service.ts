import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { bundleUserMappingStatusErrorsMessages } from "../bundle-user-mapping-status.messages";
import findBundleUserMappingStatusHelperService from "../helpers/validators/find-bundle-user-mapping-status.helper.service";
import { populateFields, bundleUserMappingStatusPayload } from "../bundle-user-mapping-status.helper";
import { bundleUserMappingStatusResponse } from "../bundle-user-mapping-status.response";

class showBundleUserMappingStatusService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];

    try {
      const bundleUserMappingStatus = await findBundleUserMappingStatusHelperService.execute(
        { _id: id },
        bundleUserMappingStatusErrorsMessages,
        {
          lean: true,
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
        },
      );

      return bundleUserMappingStatusPayload(
        "bundle_user_mapping_status_fetched",
        bundleUserMappingStatusResponse(bundleUserMappingStatus[0]),
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        bundleUserMappingStatusErrorsMessages,
        err.data,
      );
    }
  }
}

export default new showBundleUserMappingStatusService();
