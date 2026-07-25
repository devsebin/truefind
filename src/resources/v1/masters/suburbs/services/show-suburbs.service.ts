import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { suburbErrorsMessages } from "../suburbs.messages";
import findSuburbHelperService from "../helpers/validators/find-suburb.helper.service";
import { populateFields, suburbPayload } from "../suburbs.helper";
import { suburbResponse } from "../suburbs.response";

class showSuburbsService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];

    try {
      const suburb = await findSuburbHelperService.execute(
        { _id: id },
        suburbErrorsMessages,
        {
          lean: true,
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
        },
      );

      return suburbPayload(
        "suburb_fetched",
        suburbResponse(suburb[0]),
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, suburbErrorsMessages, err.data);
    }
  }
}

export default new showSuburbsService();
