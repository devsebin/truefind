import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { carouselsErrorsMessages } from "../carousels.messages";
import findCarouselsHelperService from "../helpers/validators/find-carousels.helper.service";
import { populateFields, carouselPayload } from "../carousels.helper";
import { carouselResponse } from "../carousels.response";

class ShowCarouselsService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];

    try {
      const carousel = await findCarouselsHelperService.execute(
        { _id: id },
        carouselsErrorsMessages,
        {
          lean: true,
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
        },
      );

      return carouselPayload(
        "carousels_fetched",
        carouselResponse(carousel[0]),
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, carouselsErrorsMessages, err.data);
    }
  }
}

export default new ShowCarouselsService();
