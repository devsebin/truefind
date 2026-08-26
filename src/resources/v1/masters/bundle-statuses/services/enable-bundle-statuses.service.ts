import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findBundleStatusesHelperService from "../helpers/validators/find-bundle-statuses.helper.service";
import { bundleStatusesErrorsMessages } from "../bundle-statuses.messages";
import activateBundleStatusesHelperService from "../helpers/operations/activate-bundle-statuses.helper.service";
import { bundleStatusesPayload } from "../bundle-statuses.helper";
import findBundleStatusesStateHelperService from "../helpers/validators/find-bundle-statuses-state.helper.service";

class enableBundleStatusesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const bundleStatus = await findBundleStatusesHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        bundleStatusesErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findBundleStatusesStateHelperService.isAlreadyActive(
        bundleStatus[0],
        bundleStatusesErrorsMessages,
      );

      await findBundleStatusesHelperService.execute(
        {
          $or: [
            { title: bundleStatus[0].title },
            { label: bundleStatus[0].label },
          ],
          _id: { $ne: id },
          is_deleted: false,
          is_active: true,
        },
        bundleStatusesErrorsMessages,
        {
          throwIfExists: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      await activateBundleStatusesHelperService.execute(
        bundleStatus[0],
        session,
        userId,
        dbTransactions,
        bundleStatusesErrorsMessages,
      );

      await session.commitTransaction();

      return bundleStatusesPayload(
        "bundle_statuses_activate",
        bundleStatus,
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        bundleStatusesErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new enableBundleStatusesService();
