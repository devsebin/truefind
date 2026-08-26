import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findBundlesHelperService from "../helpers/validators/find-bundles.helper.service";
import { bundlesErrorsMessages } from "../bundles.messages";
import activateBundlesHelperService from "../helpers/operations/activate-bundles.helper.service";
import { bundlesPayload } from "../bundles.helper";
import findBundlesStateHelperService from "../helpers/validators/find-bundles-state.helper.service";

class enableBundlesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const bundle = await findBundlesHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        bundlesErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findBundlesStateHelperService.isAlreadyActive(
        bundle[0],
        bundlesErrorsMessages,
      );

      await findBundlesHelperService.execute(
        {
          $or: [
            { code: bundle[0].code },
            { name: bundle[0].name },
          ],
          _id: { $ne: id },
          is_deleted: false,
          is_active: true,
        },
        bundlesErrorsMessages,
        {
          throwIfExists: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      await activateBundlesHelperService.execute(
        bundle[0],
        session,
        userId,
        dbTransactions,
        bundlesErrorsMessages,
      );

      await session.commitTransaction();

      return bundlesPayload(
        "bundle_activate",
        bundle,
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        bundlesErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new enableBundlesService();
