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
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";

class ShowServiceUserConfigurationService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const configs =
        await findServiceUserConfigurationHelperService.execute(
          { _id: id, is_deleted: false } as any,
          serviceUserConfigErrorsMessages,
          {
            throwIfNotFound: true,
            returnDocument: true,
            populate: populateFields,
            session,
          },
        );

      const config = configs[0];

      DbTransactions.push(
        await createDbTransaction(
          tableName.ServiceUserConfigurations,
          apiMethods.GET,
          operationTypes.Read,
          config,
        ),
      );

      await session.commitTransaction();

      return serviceUserConfigPayload(
        "service_user_config_fetched",
        serviceUserConfigResponse(config),
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

export default new ShowServiceUserConfigurationService();
