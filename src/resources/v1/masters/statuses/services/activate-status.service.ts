import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findStatusHelperService from "../helpers/validators/find-status.helper.service";
import { statusesErrorsMessages } from "../statuses.messages";
import activateStatusHelperService from "../helpers/operations/activate-status.helper.service";
import { statusPayload } from "../statuses.helper";
import findStatusStateHelperService from "../helpers/validators/find-state.helper.service";

class activateStatusService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const status = await findStatusHelperService.execute(
        { _id: id },
        statusesErrorsMessages,
        { lean: true, throwIfNotFound: true, returnDocument: true, session },
      );

      await findStatusStateHelperService.isAlreadyActive(
        status[0],
        statusesErrorsMessages,
      );

      const updatedStatus = await activateStatusHelperService.execute(
        status[0],
        session,
        dbTransactions,
        statusesErrorsMessages,
        userId,
      );

      await session.commitTransaction();

      return statusPayload("status_activate", updatedStatus, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, statusesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new activateStatusService();
