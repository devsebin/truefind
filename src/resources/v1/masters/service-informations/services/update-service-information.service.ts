import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  returnServiceInformationSuccess,
  throwServiceInformationError,
  populateFields,
} from "../service-informations.helper";
import { serviceInformationErrorsMessages } from "../service-informations.messages";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toUpdateServiceInformationDTO } from "../dto/service-information.dto";
import { serviceInformationResponse } from "../service-informations.response";
import updateServiceInformationHelperService from "../helpers/operations/update-service-information.helper.service";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import { getContextUserId } from "@/utils/context/request-context";
import ServiceInformationModel from "@/database/service-informations/service-information-db-model";

class UpdateServiceInformationService {
  public async execute(
    idOrServiceId: mongoose.Types.ObjectId,
    request: Request,
    payload?: any,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(
      request,
      payload,
      toUpdateServiceInformationDTO,
    );

    try {
      session.startTransaction();

      // 1. Find existing information
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

      const userIdStr = getContextUserId();
      const userId = userIdStr
        ? new mongoose.Types.ObjectId(userIdStr)
        : request.user?.id
        ? new mongoose.Types.ObjectId(request.user.id)
        : undefined;

      const updated = await updateServiceInformationHelperService.execute(
        existing._id as mongoose.Types.ObjectId,
        body,
        existing,
        userId,
        session,
        dbTransactions,
        serviceInformationErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return returnServiceInformationSuccess(
        "information_updated",
        serviceInformationResponse(updated),
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

export default new UpdateServiceInformationService();
