import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findDeclaimerHelperService from "../helpers/validators/find-declaimer.helper.service";
import { declaimerErrorsMessages } from "../declaimers.messages";
import deactivateDeclaimerHelperService from "../helpers/operations/deactivate-declaimer.helper.service";
import { declaimerPayload } from "../declaimers.helper";
import { declaimerResponse } from "../declaimers.response";

class disableDeclaimerService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
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

      const deactivated = await deactivateDeclaimerHelperService.execute(
        declaimers[0],
        session,
        userId,
        dbTransactions,
        declaimerErrorsMessages,
      );

      await session.commitTransaction();

      return declaimerPayload(
        "declaimer_deactivate",
        declaimerResponse(deactivated),
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

export default new disableDeclaimerService();
