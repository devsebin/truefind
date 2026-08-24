import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  returnServiceInformationSuccess,
  throwServiceInformationError,
  populateFields,
} from "../service-informations.helper";
import { serviceInformationErrorsMessages } from "../service-informations.messages";
import updateServiceInformationHelperService from "../helpers/operations/update-service-information.helper.service";
import { serviceInformationResponse } from "../service-informations.response";
import { getContextUserId } from "@/utils/context/request-context";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import ServiceInformationModel from "@/database/service-informations/service-information-db-model";

class EnableServiceInformationService {
  public async execute(
    idOrServiceId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await ServiceInformationModel.findOne({
        $or: [{ _id: idOrServiceId }, { service_id: idOrServiceId }],
        is_deleted: false,
      }).session(session);

      if (!existing) {
        throwServiceInformationError(
          "information_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Service information not found",
            data: { id: idOrServiceId.toString() },
          }),
        );
      }

      if (existing.is_active === true) {
        throwServiceInformationError(
          "already_enabled",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service information is already enabled",
            data: { id: idOrServiceId.toString() },
          }),
        );
      }

      const userIdStr = getContextUserId();
      const userId = userIdStr ? new mongoose.Types.ObjectId(userIdStr) : undefined;

      const saved = await updateServiceInformationHelperService.execute(
        existing._id as mongoose.Types.ObjectId,
        { is_active: true },
        existing,
        userId,
        session,
        dbTransactions,
        serviceInformationErrorsMessages,
      );

      await saved.populate(populateFields);

      await session.commitTransaction();

      return returnServiceInformationSuccess(
        "information_enabled",
        serviceInformationResponse(saved),
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceInformationErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new EnableServiceInformationService();
