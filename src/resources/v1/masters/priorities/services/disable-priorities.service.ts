import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findPrioritiesHelperService from "../helpers/validators/find-priorities.helper.service";
import { prioritiesErrorsMessages } from "../priorities.messages";
import deactivatePrioritiesHelperService from "../helpers/operations/deactivate-priorities.helper.service";
import { populateFields, prioritiesPayload, throwError } from "../priorities.helper";
import findPrioritiesStateHelperService from "../helpers/validators/find-priorities-state.helper.service";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class disablePrioritiesService {
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

      await findPrioritiesStateHelperService.isAlreadyInactive(
        priority[0],
        prioritiesErrorsMessages,
      );

      if (priority[0].is_default) {
        const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
          message: "Cannot disable default priority",
          data: { _id: id },
          filler: { 0: priority[0].title },
        });
        throwError("cannot_disable_default", response);
      }

      await deactivatePrioritiesHelperService.execute(
        priority[0],
        session,
        userId,
        dbTransactions,
        prioritiesErrorsMessages,
      );

      await session.commitTransaction();

      return prioritiesPayload("priorities_deactivate", priority, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, prioritiesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new disablePrioritiesService();
