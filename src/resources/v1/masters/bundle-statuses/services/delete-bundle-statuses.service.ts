import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findBundleStatusesHelperService from "../helpers/validators/find-bundle-statuses.helper.service";
import { bundleStatusesErrorsMessages } from "../bundle-statuses.messages";
import deleteBundleStatusesHelperService from "../helpers/operations/delete-bundle-statuses.helper.service";
import { bundleStatusesPayload } from "../bundle-statuses.helper";
import findBundleStatusesStateHelperService from "../helpers/validators/find-bundle-statuses-state.helper.service";

class deleteBundleStatusesService {
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

      const bundleStatus = await findBundleStatusesHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        bundleStatusesErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findBundleStatusesStateHelperService.isAlreadyDeleted(
        bundleStatus[0],
        bundleStatusesErrorsMessages,
      );

      if (bundleStatus[0].is_default) {
        throw new Error("cannot_delete_default");
      }

      await deleteBundleStatusesHelperService.execute(
        bundleStatus[0],
        session,
        userId,
        is_force,
        dbTransactions,
        bundleStatusesErrorsMessages,
      );

      await session.commitTransaction();

      return bundleStatusesPayload(
        "bundle_statuses_deleted",
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

export default new deleteBundleStatusesService();
