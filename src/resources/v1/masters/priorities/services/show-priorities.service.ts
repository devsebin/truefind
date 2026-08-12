import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { prioritiesErrorsMessages } from "../priorities.messages";
import findPrioritiesHelperService from "../helpers/validators/find-priorities.helper.service";
import { populateFields, prioritiesPayload } from "../priorities.helper";
import { prioritiesResponse } from "../priorities.response";

class showPrioritiesService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];

    try {
      const priority = await findPrioritiesHelperService.execute(
        { _id: id },
        prioritiesErrorsMessages,
        {
          lean: true,
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
        },
      );

      return prioritiesPayload(
        "priorities_fetched",
        prioritiesResponse(priority[0]),
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, prioritiesErrorsMessages, err.data);
    }
  }
}

export default new showPrioritiesService();
