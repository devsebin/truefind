import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findStatusHelperService from "../helpers/validators/find-status.helper.service";
import { statusesErrorsMessages } from "../statuses.messages";
import deleteStatusHelperService from "../helpers/operations/delete-status.helper.service";
import { statusPayload } from "../statuses.helper";
import findStatusStateHelperService from "../helpers/validators/find-state.helper.service";

class deleteStatusesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    is_force: boolean,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];
    try {
      session.startTransaction();
      const status = await findStatusHelperService.execute(
        { _id: id },
        statusesErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findStatusStateHelperService.isAlreadyDeleted(
        status[0],
        statusesErrorsMessages,
      );

      await findStatusStateHelperService.isDefault(
        status[0],
        statusesErrorsMessages,
      );

      await deleteStatusHelperService.execute(
        status[0],
        statusesErrorsMessages,
        session,
        dbTransactions,
        userId,
        is_force,
      );

      await session.commitTransaction();

      return statusPayload("status_deleted", status, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, statusesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new deleteStatusesService();
