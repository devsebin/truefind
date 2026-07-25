import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findSuburbHelperService from "../helpers/validators/find-suburb.helper.service";
import { suburbErrorsMessages } from "../suburbs.messages";
import deleteSuburbHelperService from "../helpers/operations/delete-suburb.helper.service";
import { suburbPayload } from "../suburbs.helper";
import findSuburbStateHelperService from "../helpers/validators/find-state.helper.service";

class deleteSuburbsService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    is_force: boolean,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      // Find suburb bypass pre(/^find/) by passing is_deleted/is_active filters
      const suburb = await findSuburbHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        suburbErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findSuburbStateHelperService.isAlreadyDeleted(
        suburb[0],
        suburbErrorsMessages,
      );

      await deleteSuburbHelperService.execute(
        suburb[0],
        session,
        userId,
        is_force,
        dbTransactions,
        suburbErrorsMessages,
      );

      await session.commitTransaction();

      return suburbPayload("suburb_deleted", suburb[0], dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, suburbErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new deleteSuburbsService();
