import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { unitsErrorsMessages } from "../units.messages";
import findUnitsHelperService from "../helpers/validators/find-units.helper.service";
import { populateFields, unitsPayload } from "../units.helper";
import { unitsResponse } from "../units.response";

class showUnitsService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];

    try {
      const unit = await findUnitsHelperService.execute(
        { _id: id },
        unitsErrorsMessages,
        {
          lean: true,
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
        },
      );

      return unitsPayload(
        "units_fetched",
        unitsResponse(unit[0]),
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, unitsErrorsMessages, err.data);
    }
  }
}

export default new showUnitsService();
