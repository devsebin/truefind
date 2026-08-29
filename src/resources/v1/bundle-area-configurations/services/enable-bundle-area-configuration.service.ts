import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  returnBundleAreaConfigSuccess,
  throwBundleAreaConfigError,
  populateFields,
} from "../bundle-area-configurations.helper";
import { bundleAreaConfigErrorsMessages } from "../bundle-area-configurations.messages";
import findBundleAreaHelperService from "../helpers/validators/find-bundle-area.helper.service";
import updateBundleAreaHelperService from "../helpers/operations/update-bundle-area.helper.service";
import { bundleAreaConfigResponse } from "../bundle-area-configurations.response";
import { getContextUserId } from "@/utils/context/request-context";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import { getActiveBundleLocationStatusId } from "@/utils/plugins/bundle-location-config-status.plugin";

class EnableBundleAreaConfigurationService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const configs = await findBundleAreaHelperService.execute(
        { _id: id, is_deleted: false } as any,
        bundleAreaConfigErrorsMessages,
        {
          throwIfNotFound: true,
          session,
        },
      );

      const existing = configs[0];
      const activeStatusId = await getActiveBundleLocationStatusId();

      // Check both status and is_active state
      if (
        existing.is_active === true &&
        existing.status_id?.toString() === activeStatusId.toString()
      ) {
        throwBundleAreaConfigError(
          "already_enabled",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Bundle area configuration is already enabled",
            data: { id },
          }),
        );
      }

      const userIdStr = getContextUserId();
      const userId = userIdStr
        ? new mongoose.Types.ObjectId(userIdStr)
        : undefined;

      const saved = await updateBundleAreaHelperService.execute(
        id,
        {
          is_active: true,
          status_id: activeStatusId,
        },
        existing,
        userId,
        session,
        dbTransactions,
        bundleAreaConfigErrorsMessages,
      );

      await session.commitTransaction();

      const populatedConfig = await findBundleAreaHelperService.execute(
        { _id: id, is_deleted: false } as any,
        bundleAreaConfigErrorsMessages,
        {
          throwIfNotFound: true,
          populate: populateFields,
        },
      );

      return returnBundleAreaConfigSuccess(
        "area_config_enabled",
        bundleAreaConfigResponse(populatedConfig[0]),
        dbTransactions,
      );

    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(
        err.message,
        bundleAreaConfigErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new EnableBundleAreaConfigurationService();
