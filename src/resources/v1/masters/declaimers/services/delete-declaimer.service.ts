import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findDeclaimerHelperService from "../helpers/validators/find-declaimer.helper.service";
import { declaimerErrorsMessages } from "../declaimers.messages";
import deleteDeclaimerHelperService from "../helpers/operations/delete-declaimer.helper.service";
import { declaimerPayload } from "../declaimers.helper";
import { declaimerResponse } from "../declaimers.response";

class deleteDeclaimerService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    force: boolean,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const declaimers = await findDeclaimerHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        declaimerErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      const deleted = await deleteDeclaimerHelperService.execute(
        declaimers[0],
        session,
        userId,
        force,
        dbTransactions,
        declaimerErrorsMessages,
      );

      await session.commitTransaction();

      return declaimerPayload(
        "declaimer_deleted",
        declaimerResponse(deleted),
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, declaimerErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new deleteDeclaimerService();
