import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findDistrictHelperService from "../helpers/validators/find-district.helper.service";
import { districtErrorsMessages } from "../districts.messages";
import disableDistrictHelperService from "../helpers/operations/disable-district.helper.service";
import { districtPayload } from "../districts.helper";
import findDistrictStateHelperService from "../helpers/validators/find-state.helper.service";

class disableDistrictsService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];
    try {
      session.startTransaction();

      const district = await findDistrictHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        districtErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findDistrictStateHelperService.isAlreadyInactive(
        district[0],
        districtErrorsMessages,
      );

      await disableDistrictHelperService.execute(
        district[0],
        session,
        userId,
        dbTransactions,
        districtErrorsMessages,
      );

      await session.commitTransaction();

      return districtPayload("district_deactivate", district, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, districtErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new disableDistrictsService();
