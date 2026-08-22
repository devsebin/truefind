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
import findServiceUserDocumentConfigurationStateHelperService from "../helpers/validators/find-service-user-document-configuration-state.helper.service";
import deleteServiceUserDocumentConfigurationHelperService from "../helpers/operations/delete-service-user-document-configuration.helper.service";

class DeleteServiceUserDocumentConfigurationService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId | undefined,
    is_force = false,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const configs =
        await findServiceUserDocumentConfigurationHelperService.execute(
          {
            _id: id,
            is_deleted: { $in: [true, false] },
            is_active: { $in: [true, false] },
          } as any,
          serviceUserDocConfigErrorsMessages,
          {
            throwIfNotFound: true,
            returnDocument: true,
            session,
          },
        );

      const config = configs[0];

      await findServiceUserDocumentConfigurationStateHelperService.isAlreadyDeleted(
        config,
        serviceUserDocConfigErrorsMessages,
      );

      const deleted =
        await deleteServiceUserDocumentConfigurationHelperService.execute(
          config,
          session,
          userId,
          is_force,
          DbTransactions,
          serviceUserDocConfigErrorsMessages,
        );

      await deleted.populate(populateFields);

      await session.commitTransaction();

      return serviceUserDocConfigPayload(
        "service_user_doc_config_deleted",
        serviceUserDocConfigResponse(deleted),
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

export default new DeleteServiceUserDocumentConfigurationService();
