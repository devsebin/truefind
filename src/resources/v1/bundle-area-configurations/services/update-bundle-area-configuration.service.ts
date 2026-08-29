import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  returnBundleAreaConfigSuccess,
  populateFields,
} from "../bundle-area-configurations.helper";
import { bundleAreaConfigErrorsMessages } from "../bundle-area-configurations.messages";
import findBundleAreaHelperService from "../helpers/validators/find-bundle-area.helper.service";
import updateBundleAreaHelperService from "../helpers/operations/update-bundle-area.helper.service";
import { bundleAreaConfigResponse } from "../bundle-area-configurations.response";
import { getContextUserId } from "@/utils/context/request-context";
import { toUpdateBundleAreaConfigurationDTO } from "../dto/bundle-area-configuration.dto";
import findUnitsHelperService from "@/resources/v1/masters/units/helpers/validators/find-units.helper.service";
import { unitsErrorsMessages } from "@/resources/v1/masters/units/units.messages";
import findCurrencyHelperService from "@/resources/v1/masters/currencies/helpers/validators/find-currencies.helper.service";
import { currenciesErrorsMessages } from "@/resources/v1/masters/currencies/currencies.messages";
import { getUnlinkedBundleLocationStatusId } from "@/utils/plugins/bundle-location-config-status.plugin";

class UpdateBundleAreaConfigurationService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
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
      const payload = toUpdateBundleAreaConfigurationDTO(request.body);

      // Validate unit_id if provided
      if (payload.unit_id) {
        await findUnitsHelperService.execute(
          {
            _id: payload.unit_id,
            is_deleted: false,
            is_active: true,
          } as any,
          unitsErrorsMessages,
          {
            throwIfNotFound: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      // Validate currency_id if provided
      if (payload.currency_id) {
        await findCurrencyHelperService.execute(
          {
            _id: payload.currency_id,
            is_deleted: false,
            is_active: true,
          } as any,
          currenciesErrorsMessages,
          {
            throwIfNotFound: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      // In update, if is_active is explicitly false, change status_id into "unlinked"
      if (payload.is_active === false && !payload.status_id) {
        payload.status_id = await getUnlinkedBundleLocationStatusId();
      }

      const userIdStr = getContextUserId();
      const userId = userIdStr
        ? new mongoose.Types.ObjectId(userIdStr)
        : undefined;

      const saved = await updateBundleAreaHelperService.execute(
        id,
        payload,
        existing,
        userId,
        session,
        dbTransactions,
        bundleAreaConfigErrorsMessages,
      );

      await saved.populate(populateFields);

      await session.commitTransaction();

      return returnBundleAreaConfigSuccess(
        "area_config_updated",
        bundleAreaConfigResponse(saved),
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

export default new UpdateBundleAreaConfigurationService();
