import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findUnitsHelperService from "../helpers/validators/find-units.helper.service";
import { unitsErrorsMessages } from "../units.messages";
import deleteUnitsHelperService from "../helpers/operations/delete-units.helper.service";
import { unitsPayload } from "../units.helper";
import findUnitsStateHelperService from "../helpers/validators/find-units-state.helper.service";

class deleteUnitsService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    is_force: boolean,
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

      await findUnitsStateHelperService.isAlreadyDeleted(
        unit[0],
        unitsErrorsMessages,
      );

      if (unit[0].is_default) {
        throw new Error("cannot_delete_default");
      }

      await deleteUnitsHelperService.execute(
        unit[0],
        session,
        userId,
        is_force,
        dbTransactions,
        unitsErrorsMessages,
      );

      await session.commitTransaction();

      return unitsPayload("units_deleted", unit, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, unitsErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new deleteUnitsService();
