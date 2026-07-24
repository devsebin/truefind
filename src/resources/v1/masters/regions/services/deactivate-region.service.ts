import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findRegionHelperService from "../helpers/validators/find-region.helper.service";
import { regionErrorsMessages } from "../regions.messages";
import deactivateRegionHelperService from "../helpers/operations/deactivate-region.helper.service";
import { regionPayload } from "../regions.helper";
import findRegionStateHelperService from "../helpers/validators/find-state.helper.service";

class deactivateRegionService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];
    try {
      session.startTransaction();

      const region = await findRegionHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        regionErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findRegionStateHelperService.isAlreadyInactive(
        region[0],
        regionErrorsMessages,
      );

      await deactivateRegionHelperService.execute(
        region[0],
        session,
        userId,
        dbTransactions,
        regionErrorsMessages,
      );

      await session.commitTransaction();

      return regionPayload("region_deactivate", region, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, regionErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new deactivateRegionService();
