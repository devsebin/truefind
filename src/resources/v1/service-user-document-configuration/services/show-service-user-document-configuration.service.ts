import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  serviceUserDocConfigPayload,
  populateFields,
} from "../service-user-document-configuration.helper";
import { serviceUserDocConfigErrorsMessages } from "../service-user-document-configuration.messages";
import { serviceUserDocConfigResponse } from "../service-user-document-configuration.response";
import findServiceUserDocumentConfigurationHelperService from "../helpers/validators/find-service-user-document-configuration.helper.service";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";

class ShowServiceUserDocumentConfigurationService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const configs =
        await findServiceUserDocumentConfigurationHelperService.execute(
          { _id: id, is_deleted: false } as any,
          serviceUserDocConfigErrorsMessages,
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
          tableName.ServiceUserDocumentConfigurations,
          apiMethods.GET,
          operationTypes.Read,
          config,
        ),
      );

      await session.commitTransaction();

      return serviceUserDocConfigPayload(
        "service_user_doc_config_fetched",
        serviceUserDocConfigResponse(config),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(
        err.message,
        serviceUserDocConfigErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new ShowServiceUserDocumentConfigurationService();
