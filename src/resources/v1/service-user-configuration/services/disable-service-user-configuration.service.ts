import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  serviceUserConfigPayload,
  populateFields,
} from "../service-user-configuration.helper";
import { serviceUserConfigErrorsMessages } from "../service-user-configuration.messages";
import { serviceUserConfigResponse } from "../service-user-configuration.response";
import findServiceUserConfigurationHelperService from "../helpers/validators/find-service-user-configuration.helper.service";
import findServiceUserConfigurationStateHelperService from "../helpers/validators/find-service-user-configuration-state.helper.service";
import deactivateServiceUserConfigurationHelperService from "../helpers/operations/deactivate-service-user-configuration.helper.service";

class DisableServiceUserConfigurationService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId | undefined,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const configs =
        await findServiceUserConfigurationHelperService.execute(
          {
            _id: id,
            is_deleted: { $in: [true, false] },
            is_active: { $in: [true, false] },
          } as any,
          serviceUserConfigErrorsMessages,
          {
            throwIfNotFound: true,
            returnDocument: true,
            session,
          },
        );

      const config = configs[0];

      await findServiceUserConfigurationStateHelperService.isAlreadyInactive(
        config,
        serviceUserConfigErrorsMessages,
      );

      const deactivated =
        await deactivateServiceUserConfigurationHelperService.execute(
          config,
          session,
          userId,
          DbTransactions,
          serviceUserConfigErrorsMessages,
        );

      await deactivated.populate(populateFields);

      await session.commitTransaction();

      return serviceUserConfigPayload(
        "service_user_config_deactivated",
        serviceUserConfigResponse(deactivated),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(
        err.message,
        serviceUserConfigErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new DisableServiceUserConfigurationService();
