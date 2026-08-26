import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findBundleUserMappingStatusHelperService from "../helpers/validators/find-bundle-user-mapping-status.helper.service";
import { bundleUserMappingStatusErrorsMessages } from "../bundle-user-mapping-status.messages";
import deleteBundleUserMappingStatusHelperService from "../helpers/operations/delete-bundle-user-mapping-status.helper.service";
import { bundleUserMappingStatusPayload } from "../bundle-user-mapping-status.helper";
import findBundleUserMappingStatusStateHelperService from "../helpers/validators/find-bundle-user-mapping-status-state.helper.service";

class deleteBundleUserMappingStatusService {
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

      const bundleUserMappingStatus = await findBundleUserMappingStatusHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        bundleUserMappingStatusErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findBundleUserMappingStatusStateHelperService.isAlreadyDeleted(
        bundleUserMappingStatus[0],
        bundleUserMappingStatusErrorsMessages,
      );

      if (bundleUserMappingStatus[0].is_default) {
        throw new Error("cannot_delete_default");
      }

      await deleteBundleUserMappingStatusHelperService.execute(
        bundleUserMappingStatus[0],
        session,
        userId,
        is_force,
        dbTransactions,
        bundleUserMappingStatusErrorsMessages,
      );

      await session.commitTransaction();

      return bundleUserMappingStatusPayload(
        "bundle_user_mapping_status_deleted",
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

export default new deleteBundleUserMappingStatusService();
