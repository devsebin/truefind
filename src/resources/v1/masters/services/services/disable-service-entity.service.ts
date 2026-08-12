import { BaseServiceModel } from "@/database/services/services-db-model";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import mongoose from "mongoose";
import { returnServiceSuccess, throwError } from "../services.helper";
import { servicesErrorsMessages } from "../services.messages";
import deactivateServiceEntityHelperService from "../helpers/operations/deactivate-service-entity.helper.service";
import updateDescendantsHelperService from "../helpers/operations/update-descendants.helper.service";
import { serviceResponse } from "../services.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";

class disableServiceEntityService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const existing = await BaseServiceModel.findById(id).session(session);

      if (!existing || existing.is_deleted) {
        throwError(
          "something_went_wrong",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Entity not found",
            data: { id },
          }),
        );
      }

      // 1. Deactivate parent entity itself
      const saved = await deactivateServiceEntityHelperService.execute(
        existing,
        session,
        userId,
        dbTransactions,
      );

      // 2. Deactivate and cascade descendants (subcategories and services)
      await updateDescendantsHelperService.deactivate(
        existing,
        session,
        userId,
        dbTransactions,
        "parent_disabled",
      );

      await session.commitTransaction();

      return returnServiceSuccess(
        "service_updated",
        serviceResponse(saved),
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, servicesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new disableServiceEntityService();
