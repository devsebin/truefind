import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findBundleUserMappingStatusHelperService from "../helpers/validators/find-bundle-user-mapping-status.helper.service";
import { bundleUserMappingStatusErrorsMessages } from "../bundle-user-mapping-status.messages";
import deactivateBundleUserMappingStatusHelperService from "../helpers/operations/deactivate-bundle-user-mapping-status.helper.service";
import { bundleUserMappingStatusPayload } from "../bundle-user-mapping-status.helper";
import findBundleUserMappingStatusStateHelperService from "../helpers/validators/find-bundle-user-mapping-status-state.helper.service";

class disableBundleUserMappingStatusService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const bundleUserMappingStatus = await findBundleUserMappingStatusHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        bundleUserMappingStatusErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findBundleUserMappingStatusStateHelperService.isAlreadyInactive(
        bundleUserMappingStatus[0],
        bundleUserMappingStatusErrorsMessages,
      );

      if (bundleUserMappingStatus[0].is_default) {
        throw new Error("cannot_disable_default");
      }

      await deactivateBundleUserMappingStatusHelperService.execute(
        bundleUserMappingStatus[0],
        session,
        userId,
        dbTransactions,
        bundleUserMappingStatusErrorsMessages,
      );

      await session.commitTransaction();

      return bundleUserMappingStatusPayload(
        "bundle_user_mapping_status_deactivate",
        bundleUserMappingStatus,
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        bundleUserMappingStatusErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new disableBundleUserMappingStatusService();
