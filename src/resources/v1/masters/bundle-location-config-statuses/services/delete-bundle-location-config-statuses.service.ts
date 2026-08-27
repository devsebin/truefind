import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findBundleLocationConfigStatusesHelperService from "../helpers/validators/find-bundle-location-config-statuses.helper.service";
import { bundleLocationConfigStatusesErrorsMessages } from "../bundle-location-config-statuses.messages";
import deleteBundleLocationConfigStatusesHelperService from "../helpers/operations/delete-bundle-location-config-statuses.helper.service";
import {
  populateFields,
  bundleLocationConfigStatusesPayload,
  throwError,
} from "../bundle-location-config-statuses.helper";
import findBundleLocationConfigStatusesStateHelperService from "../helpers/validators/find-bundle-location-config-statuses-state.helper.service";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class deleteBundleLocationConfigStatusesService {
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

      await findBundleLocationConfigStatusesStateHelperService.isAlreadyDeleted(
        bundleLocationConfigStatus[0],
        bundleLocationConfigStatusesErrorsMessages,
      );

      if (bundleLocationConfigStatus[0].is_default) {
        const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
          message: "Cannot delete default bundle location config status",
          data: { _id: id },
          filler: { 0: bundleLocationConfigStatus[0].title },
        });
        throwError("cannot_delete_default", response);
      }

      await deleteBundleLocationConfigStatusesHelperService.execute(
        bundleLocationConfigStatus[0],
        session,
        userId,
        is_force,
        dbTransactions,
        bundleLocationConfigStatusesErrorsMessages,
      );

      await session.commitTransaction();

      return bundleLocationConfigStatusesPayload(
        "bundle_location_config_statuses_deleted",
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

export default new deleteBundleLocationConfigStatusesService();
