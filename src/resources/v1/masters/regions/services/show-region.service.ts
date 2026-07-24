import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { regionErrorsMessages } from "../regions.messages";
import findRegionHelperService from "../helpers/validators/find-region.helper.service";
import { populateFields, regionPayload } from "../regions.helper";
import { regionResponse } from "../regions.response";

class showRegionService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];

    try {
      const region = await findRegionHelperService.execute(
        { _id: id },
        regionErrorsMessages,
        {
          lean: true,
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
        },
      );

      return regionPayload(
        "region_fetched",
        regionResponse(region[0]),
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, regionErrorsMessages, err.data);
    }
  }
}

export default new showRegionService();
