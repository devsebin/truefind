import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findCountryHelperService from "../helpers/validators/find-country.helper.service";
import { countryErrorsMessages } from "../countries.messages";
import deactivateCountryHelperService from "../helpers/operations/deactivate-country.helper.service";
import { countryPayload } from "../countries.helper";
import findCountryStateHelperService from "../helpers/validators/find-state.helper.service";

class disableCountryService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const country = await findCountryHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        countryErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findCountryStateHelperService.isAlreadyInactive(
        country[0],
        countryErrorsMessages,
      );

      await deactivateCountryHelperService.execute(
        country[0],
        session,
        userId,
        dbTransactions,
        countryErrorsMessages,
      );

      await session.commitTransaction();

      return countryPayload("country_deactivate", country, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, countryErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new disableCountryService();
