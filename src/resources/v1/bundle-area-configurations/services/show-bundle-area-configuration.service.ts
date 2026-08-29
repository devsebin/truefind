import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  returnBundleAreaConfigSuccess,
  populateFields,
} from "../bundle-area-configurations.helper";
import { bundleAreaConfigErrorsMessages } from "../bundle-area-configurations.messages";
import { bundleAreaConfigResponse } from "../bundle-area-configurations.response";
import findBundleAreaHelperService from "../helpers/validators/find-bundle-area.helper.service";

class ShowBundleAreaConfigurationService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const configs = await findBundleAreaHelperService.execute(
        { _id: id, is_deleted: false } as any,
        bundleAreaConfigErrorsMessages,
        {
          throwIfNotFound: true,
          session,
          populate: populateFields,
        },
      );

      const config = configs[0];

      await session.commitTransaction();

      return returnBundleAreaConfigSuccess(
        "area_config_fetched",
        bundleAreaConfigResponse(config),
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(
        err.message,
        bundleAreaConfigErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new ShowBundleAreaConfigurationService();
