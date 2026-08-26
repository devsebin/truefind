import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
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

      return bundlesPayload(
        "bundle_fetched",
        bundleResponse(bundle[0]),
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
