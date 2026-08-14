import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { returnAreaConfigSuccess, populateFields } from "../service-area-configurations.helper";
import { serviceAreaConfigErrorsMessages } from "../service-area-configurations.messages";
import findServiceAreaHelperService from "../helpers/validators/find-service-area.helper.service";
import updateServiceAreaHelperService from "../helpers/operations/update-service-area.helper.service";
import { serviceAreaConfigResponse } from "../service-area-configurations.response";
import { getContextUserId } from "@/utils/context/request-context";

import findUnitsHelperService from "@/resources/v1/masters/units/helpers/validators/find-units.helper.service";
import { unitsErrorsMessages } from "@/resources/v1/masters/units/units.messages";


class UpdateServiceAreaConfigurationService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const configs = await findServiceAreaHelperService.execute(
        { _id: id },
        serviceAreaConfigErrorsMessages,
        {
          throwIfNotFound: true,
          session,
        }
      );

      const existing = configs[0];

      // Validate unit_id if it is being updated
      if (request.body.unit_id) {
        await findUnitsHelperService.execute(
          { _id: request.body.unit_id, is_deleted: false, is_active: true } as any,
          unitsErrorsMessages,
          {
            throwIfNotFound: true,
            lean: true,
            returnDocument: false,
            session,
          }
        );
      }

      const userIdStr = getContextUserId();
      const userId = userIdStr ? new mongoose.Types.ObjectId(userIdStr) : undefined;

      const saved = await updateServiceAreaHelperService.execute(
        id,
        request.body,
        existing,
        userId,
        session,
        dbTransactions,
        serviceAreaConfigErrorsMessages
      );

      await saved.populate(populateFields);

      await session.commitTransaction();

      return returnAreaConfigSuccess(
        "area_config_updated",
        serviceAreaConfigResponse(saved),
        dbTransactions
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceAreaConfigErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new UpdateServiceAreaConfigurationService();
