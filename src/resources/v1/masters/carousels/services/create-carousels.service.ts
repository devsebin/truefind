import { SingleResponse } from "@/utils/responses/success.response";
import { IInputICarouselPayloadStrict } from "../payloads/carousel-payload";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toCarouselDTO } from "../dto/create-carousel.dto";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { carouselsErrorsMessages } from "../carousels.messages";
import { populateFields, carouselPayload } from "../carousels.helper";
import createCarouselsHelperService from "../helpers/operations/create-carousels.helper.service";
import { carouselResponse } from "../carousels.response";

class CreateCarouselService {
  public async execute(
    request: Request,
    payload?: IInputICarouselPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toCarouselDTO);

    try {
      session.startTransaction();

      const newCarousel = await createCarouselsHelperService.execute(
        body,
        session,
        DbTransactions,
        carouselsErrorsMessages,
      );

      await newCarousel.populate(populateFields);

      await session.commitTransaction();
      return carouselPayload(
        "carousels_created",
        carouselResponse(newCarousel),
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

export default new CreateCarouselService();
