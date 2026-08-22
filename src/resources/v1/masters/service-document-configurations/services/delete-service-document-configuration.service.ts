import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  returnServiceDocumentConfigSuccess,
  throwServiceDocumentConfigError,
} from "../service-document-configurations.helper";
import { serviceDocumentConfigErrorsMessages } from "../service-document-configurations.messages";
import updateServiceDocumentConfigurationHelperService from "../helpers/operations/update-service-document-configuration.helper.service";
import { serviceDocumentConfigResponse } from "../service-document-configurations.response";
import { getContextUserId } from "@/utils/context/request-context";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import ServiceDocumentConfigurationModel from "@/database/service-document-configuration/service-document-configuration-db-model";

class DeleteServiceDocumentConfigurationService {
  public async execute(
    idOrServiceId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await ServiceDocumentConfigurationModel.findOne({
        $or: [{ _id: idOrServiceId }, { service_id: idOrServiceId }],
        is_deleted: false,
      }).session(session);

      if (!existing) {
        throwServiceDocumentConfigError(
          "config_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Service document configuration not found",
            data: { id: idOrServiceId.toString() },
          }),
        );
      }

      const userIdStr = getContextUserId();
      const userId = userIdStr ? new mongoose.Types.ObjectId(userIdStr) : undefined;

      const saved = await updateServiceDocumentConfigurationHelperService.execute(
        existing._id as mongoose.Types.ObjectId,
        { is_deleted: true, is_active: false },
        existing,
        userId,
        session,
        dbTransactions,
        serviceDocumentConfigErrorsMessages,
      );

      await session.commitTransaction();

      return returnServiceDocumentConfigSuccess(
        "config_deleted",
        serviceDocumentConfigResponse(saved),
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceDocumentConfigErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new DeleteServiceDocumentConfigurationService();
