import { BaseServiceModel } from "@/database/services/services-db-model";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import mongoose from "mongoose";
import { returnServiceSuccess, throwError } from "../services.helper";
import { servicesErrorsMessages } from "../services.messages";
import { serviceResponse } from "../services.response";

class showServiceEntityService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    try {
      const doc = await BaseServiceModel.findById(id)
        .populate("icon")
        .populate({
          path: "children",
          populate: {
            path: "icon"
          }
        });

      if (!doc || doc.is_deleted) {
        throwError(
          "something_went_wrong",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Entity not found",
            data: { id },
          }),
        );
      }

      return returnServiceSuccess(
        "service_fetched",
        serviceResponse(doc),
      );
    } catch (error) {
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, servicesErrorsMessages, err.data);
    }
  }
}

export default new showServiceEntityService();
