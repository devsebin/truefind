import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findRegionHelperService from "../helpers/validators/find-region.helper.service";
import { regionErrorsMessages } from "../regions.messages";
import deleteRegionHelperService from "../helpers/operations/delete-region.helper.service";
import { regionPayload } from "../regions.helper";
import findRegionStateHelperService from "../helpers/validators/find-state.helper.service";

class deleteRegionService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    is_force: boolean,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      // Find region bypass pre(/^find/) by passing is_deleted/is_active filters
      const region = await findRegionHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        regionErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findRegionStateHelperService.isAlreadyDeleted(
        region[0],
        regionErrorsMessages,
      );

      await deleteRegionHelperService.execute(
        region[0],
        session,
        userId,
        is_force,
        dbTransactions,
        regionErrorsMessages,
      );

      await session.commitTransaction();

      return regionPayload("region_deleted", region, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, regionErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new deleteRegionService();
