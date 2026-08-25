import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { returnAreaConfigSuccess, throwAreaConfigError, populateFields } from "../service-area-configurations.helper";
import { serviceAreaConfigErrorsMessages } from "../service-area-configurations.messages";
import findServiceAreaHelperService from "../helpers/validators/find-service-area.helper.service";
import updateServiceAreaHelperService from "../helpers/operations/update-service-area.helper.service";
import { serviceAreaConfigResponse } from "../service-area-configurations.response";
import { getContextUserId } from "@/utils/context/request-context";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";

class DisableServiceAreaConfigurationService {
  public async execute(
    id: mongoose.Types.ObjectId
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

      if (existing.is_active === false) {
        throwAreaConfigError(
          "already_disabled",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service area configuration is already disabled",
            data: { id },
          })
        );
      }

      const userIdStr = getContextUserId();
      const userId = userIdStr ? new mongoose.Types.ObjectId(userIdStr) : undefined;

      const saved = await updateServiceAreaHelperService.execute(
        id,
        { is_active: false },
        existing,
        userId,
        session,
        dbTransactions,
        serviceAreaConfigErrorsMessages
      );

      await saved.populate(populateFields);

      await session.commitTransaction();

      return returnAreaConfigSuccess(
        "area_config_disabled",
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

export default new DisableServiceAreaConfigurationService();
