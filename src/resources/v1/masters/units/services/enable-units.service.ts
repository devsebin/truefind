import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findUnitsHelperService from "../helpers/validators/find-units.helper.service";
import { unitsErrorsMessages } from "../units.messages";
import activateUnitsHelperService from "../helpers/operations/activate-units.helper.service";
import { unitsPayload } from "../units.helper";
import findUnitsStateHelperService from "../helpers/validators/find-units-state.helper.service";

class enableUnitsService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const unit = await findUnitsHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        unitsErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findUnitsStateHelperService.isAlreadyActive(
        unit[0],
        unitsErrorsMessages,
      );

      await findUnitsHelperService.execute(
        {
          $or: [
            { title: unit[0].title },
            { label: unit[0].label },
          ],
          _id: { $ne: id },
          is_deleted: false,
          is_active: true,
        },
        unitsErrorsMessages,
        {
          throwIfExists: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      await activateUnitsHelperService.execute(
        unit[0],
        session,
        userId,
        dbTransactions,
        unitsErrorsMessages,
      );

      await session.commitTransaction();

      return unitsPayload("units_activate", unit, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, unitsErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new enableUnitsService();
