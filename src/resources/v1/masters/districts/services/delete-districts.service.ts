import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findDistrictHelperService from "../helpers/validators/find-district.helper.service";
import { districtErrorsMessages } from "../districts.messages";
import deleteDistrictHelperService from "../helpers/operations/delete-district.helper.service";
import { districtPayload } from "../districts.helper";
import findDistrictStateHelperService from "../helpers/validators/find-state.helper.service";
import updateRelatedEntitiesHelperService from "../helpers/operations/update-related-entities.helper.service";

class deleteDistrictsService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    is_force: boolean,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      // Find district bypass pre(/^find/) by passing is_deleted/is_active filters
      const district = await findDistrictHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        districtErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findDistrictStateHelperService.isAlreadyDeleted(
        district[0],
        districtErrorsMessages,
      );

      await deleteDistrictHelperService.execute(
        district[0],
        session,
        userId,
        is_force,
        dbTransactions,
        districtErrorsMessages,
      );

      await updateRelatedEntitiesHelperService.deactivate(
        district[0],
        session,
        userId,
        dbTransactions,
        "parent_deleted",
      );

      await session.commitTransaction();

      return districtPayload("district_deleted", district, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, districtErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new deleteDistrictsService();
