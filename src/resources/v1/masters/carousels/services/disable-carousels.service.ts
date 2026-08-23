import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findCarouselsHelperService from "../helpers/validators/find-carousels.helper.service";
import { carouselsErrorsMessages } from "../carousels.messages";
import deactivateCarouselsHelperService from "../helpers/operations/deactivate-carousels.helper.service";
import { carouselPayload } from "../carousels.helper";
import findCarouselsStateHelperService from "../helpers/validators/find-carousels-state.helper.service";

class DisableCarouselsService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const carousel = await findCarouselsHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        carouselsErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findCarouselsStateHelperService.isAlreadyInactive(
        carousel[0],
        carouselsErrorsMessages,
      );

      await deactivateCarouselsHelperService.execute(
        carousel[0],
        session,
        userId,
        dbTransactions,
        carouselsErrorsMessages,
      );

      await session.commitTransaction();

      return carouselPayload("carousels_deactivate", carousel, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, carouselsErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new DisableCarouselsService();
