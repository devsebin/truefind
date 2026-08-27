import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findBundleLocationConfigStatusesHelperService from "../helpers/validators/find-bundle-location-config-statuses.helper.service";
import { bundleLocationConfigStatusesErrorsMessages } from "../bundle-location-config-statuses.messages";
import deactivateBundleLocationConfigStatusesHelperService from "../helpers/operations/deactivate-bundle-location-config-statuses.helper.service";
import {
  populateFields,
  bundleLocationConfigStatusesPayload,
  throwError,
} from "../bundle-location-config-statuses.helper";
import findBundleLocationConfigStatusesStateHelperService from "../helpers/validators/find-bundle-location-config-statuses-state.helper.service";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class disableBundleLocationConfigStatusesService {
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

      await findBundleLocationConfigStatusesStateHelperService.isAlreadyInactive(
        bundleLocationConfigStatus[0],
        bundleLocationConfigStatusesErrorsMessages,
      );

      if (bundleLocationConfigStatus[0].is_default) {
        const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
          message: "Cannot disable default bundle location config status",
          data: { _id: id },
          filler: { 0: bundleLocationConfigStatus[0].title },
        });
        throwError("cannot_disable_default", response);
      }

      await deactivateBundleLocationConfigStatusesHelperService.execute(
        bundleLocationConfigStatus[0],
        session,
        userId,
        dbTransactions,
        bundleLocationConfigStatusesErrorsMessages,
      );

      await session.commitTransaction();

      return bundleLocationConfigStatusesPayload(
        "bundle_location_config_statuses_deactivate",
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

export default new disableBundleLocationConfigStatusesService();
