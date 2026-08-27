import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findBundleLocationConfigStatusesHelperService from "../helpers/validators/find-bundle-location-config-statuses.helper.service";
import { bundleLocationConfigStatusesErrorsMessages } from "../bundle-location-config-statuses.messages";
import activateBundleLocationConfigStatusesHelperService from "../helpers/operations/activate-bundle-location-config-statuses.helper.service";
import { bundleLocationConfigStatusesPayload } from "../bundle-location-config-statuses.helper";
import findBundleLocationConfigStatusesStateHelperService from "../helpers/validators/find-bundle-location-config-statuses-state.helper.service";

class enableBundleLocationConfigStatusesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const bundleLocationConfigStatus =
        await findBundleLocationConfigStatusesHelperService.execute(
          {
            _id: id,
            is_deleted: { $in: [true, false] },
            is_active: { $in: [true, false] },
          } as any,
          bundleLocationConfigStatusesErrorsMessages,
          { throwIfNotFound: true, returnDocument: true, session },
        );

      await findBundleLocationConfigStatusesStateHelperService.isAlreadyActive(
        bundleLocationConfigStatus[0],
        bundleLocationConfigStatusesErrorsMessages,
      );

      await findBundleLocationConfigStatusesHelperService.execute(
        {
          $or: [
            { title: bundleLocationConfigStatus[0].title },
            { label: bundleLocationConfigStatus[0].label },
          ],
          _id: { $ne: id },
          is_deleted: false,
          is_active: true,
        },
        bundleLocationConfigStatusesErrorsMessages,
        {
          throwIfExists: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      await activateBundleLocationConfigStatusesHelperService.execute(
        bundleLocationConfigStatus[0],
        session,
        userId,
        dbTransactions,
        bundleLocationConfigStatusesErrorsMessages,
      );

      await session.commitTransaction();

      return bundleLocationConfigStatusesPayload(
        "bundle_location_config_statuses_activate",
        bundleLocationConfigStatus,
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        bundleLocationConfigStatusesErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new enableBundleLocationConfigStatusesService();
