import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findBundlesHelperService from "../helpers/validators/find-bundles.helper.service";
import { bundlesErrorsMessages } from "../bundles.messages";
import deleteBundlesHelperService from "../helpers/operations/delete-bundles.helper.service";
import { bundlesPayload } from "../bundles.helper";
import findBundlesStateHelperService from "../helpers/validators/find-bundles-state.helper.service";

class deleteBundlesService {
  constructor() {}

  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    is_force: boolean,
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

      await findBundlesStateHelperService.isAlreadyDeleted(
        bundle[0],
        bundlesErrorsMessages,
      );

      await deleteBundlesHelperService.execute(
        bundle[0],
        session,
        userId,
        is_force,
        dbTransactions,
        bundlesErrorsMessages,
      );

      await session.commitTransaction();

      return bundlesPayload(
        "bundle_deleted",
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

export default new deleteBundlesService();
