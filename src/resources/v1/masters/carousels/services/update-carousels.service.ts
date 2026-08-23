import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { Request } from "express";
import findCarouselsHelperService from "../helpers/validators/find-carousels.helper.service";
import { populateFields, carouselPayload } from "../carousels.helper";
import { carouselsErrorsMessages } from "../carousels.messages";
import updateCarouselsHelperService from "../helpers/operations/update-carousels.helper.service";
import { IInputICarouselPayloadStrict } from "../payloads/carousel-payload";
import { carouselResponse } from "../carousels.response";

class UpdateCarouselsService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: Partial<IInputICarouselPayloadStrict>,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await findCarouselsHelperService.execute(
        { _id: id },
        carouselsErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const body = payload ?? (request.body as Partial<IInputICarouselPayloadStrict>);

      const updated = await updateCarouselsHelperService.execute(
        id,
        body,
        existing[0],
        session,
        DbTransactions,
        carouselsErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return carouselPayload(
        "carousels_updated",
        carouselResponse(updated),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, carouselsErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new UpdateCarouselsService();
