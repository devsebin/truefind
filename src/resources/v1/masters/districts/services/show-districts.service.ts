import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { districtErrorsMessages } from "../districts.messages";
import findDistrictHelperService from "../helpers/validators/find-district.helper.service";
import { populateFields, districtPayload } from "../districts.helper";
import { districtResponse } from "../districts.response";

class showDistrictsService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];

    try {
      const district = await findDistrictHelperService.execute(
        { _id: id },
        districtErrorsMessages,
        {
          lean: true,
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
        },
      );

      return districtPayload(
        "district_fetched",
        districtResponse(district[0]),
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, districtErrorsMessages, err.data);
    }
  }
}

export default new showDistrictsService();
