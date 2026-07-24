import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { statusesErrorsMessages } from "../statuses.messages";
import findStatusHelperService from "../helpers/validators/find-status.helper.service";
import { populateFields, statusPayload } from "../statuses.helper";
import { statusResponse } from "../statuses.response";

class showStatusesService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const status = await findStatusHelperService.execute(
        { _id: id },
        statusesErrorsMessages,
        {
          lean: true,
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
        },
      );

      await session.commitTransaction();

      return statusPayload(
        "status_fetched",
        statusResponse(status[0]),
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, statusesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new showStatusesService();
