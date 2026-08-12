import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findPrioritiesHelperService from "../helpers/validators/find-priorities.helper.service";
import { prioritiesErrorsMessages } from "../priorities.messages";
import deletePrioritiesHelperService from "../helpers/operations/delete-priorities.helper.service";
import { prioritiesPayload } from "../priorities.helper";
import findPrioritiesStateHelperService from "../helpers/validators/find-priorities-state.helper.service";

class deletePrioritiesService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    is_force: boolean,
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

      await findPrioritiesStateHelperService.isAlreadyDeleted(
        priority[0],
        prioritiesErrorsMessages,
      );

      if (priority[0].is_default) {
        throw new Error("cannot_delete_default");
      }

      await deletePrioritiesHelperService.execute(
        priority[0],
        session,
        userId,
        is_force,
        dbTransactions,
        prioritiesErrorsMessages,
      );

      await session.commitTransaction();

      return prioritiesPayload("priorities_deleted", priority, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, prioritiesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new deletePrioritiesService();
