import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findBundleUserMappingStatusHelperService from "../helpers/validators/find-bundle-user-mapping-status.helper.service";
import { bundleUserMappingStatusErrorsMessages } from "../bundle-user-mapping-status.messages";
import activateBundleUserMappingStatusHelperService from "../helpers/operations/activate-bundle-user-mapping-status.helper.service";
import { bundleUserMappingStatusPayload } from "../bundle-user-mapping-status.helper";
import findBundleUserMappingStatusStateHelperService from "../helpers/validators/find-bundle-user-mapping-status-state.helper.service";

class enableBundleUserMappingStatusService {
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

      await findBundleUserMappingStatusStateHelperService.isAlreadyActive(
        bundleUserMappingStatus[0],
        bundleUserMappingStatusErrorsMessages,
      );

      await findBundleUserMappingStatusHelperService.execute(
        {
          $or: [
            { title: bundleUserMappingStatus[0].title },
            { label: bundleUserMappingStatus[0].label },
          ],
          _id: { $ne: id },
          is_deleted: false,
          is_active: true,
        },
        bundleUserMappingStatusErrorsMessages,
        {
          throwIfExists: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      await activateBundleUserMappingStatusHelperService.execute(
        bundleUserMappingStatus[0],
        session,
        userId,
        dbTransactions,
        bundleUserMappingStatusErrorsMessages,
      );

      await session.commitTransaction();

      return bundleUserMappingStatusPayload(
        "bundle_user_mapping_status_activate",
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

export default new enableBundleUserMappingStatusService();
