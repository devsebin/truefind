import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findPrioritiesHelperService from "../helpers/validators/find-priorities.helper.service";
import { prioritiesErrorsMessages } from "../priorities.messages";
import activatePrioritiesHelperService from "../helpers/operations/activate-priorities.helper.service";
import { prioritiesPayload } from "../priorities.helper";
import findPrioritiesStateHelperService from "../helpers/validators/find-priorities-state.helper.service";

class enablePrioritiesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const priority = await findPrioritiesHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        prioritiesErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findPrioritiesStateHelperService.isAlreadyActive(
        priority[0],
        prioritiesErrorsMessages,
      );

      await findPrioritiesHelperService.execute(
        {
          $or: [
            { title: priority[0].title },
            { label: priority[0].label },
          ],
          _id: { $ne: id },
          is_deleted: false,
          is_active: true,
        },
        prioritiesErrorsMessages,
        {
          throwIfExists: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      await activatePrioritiesHelperService.execute(
        priority[0],
        session,
        userId,
        dbTransactions,
        prioritiesErrorsMessages,
      );

      await session.commitTransaction();

      return prioritiesPayload("priorities_activate", priority, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, prioritiesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new enablePrioritiesService();
