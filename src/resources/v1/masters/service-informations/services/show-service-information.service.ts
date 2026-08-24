import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import mongoose from "mongoose";
import {
  returnServiceInformationSuccess,
  populateFields,
} from "../service-informations.helper";
import { serviceInformationErrorsMessages } from "../service-informations.messages";
import { serviceInformationResponse } from "../service-informations.response";
import ServiceInformationModel from "@/database/service-informations/service-information-db-model";

class ShowServiceInformationService {
  public async execute(
    idOrServiceId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    try {
      // Find either by _id or service_id
      const info = await ServiceInformationModel.findOne({
        $or: [{ _id: idOrServiceId }, { service_id: idOrServiceId }],
        is_deleted: false,
      }).populate(populateFields);

      if (!info) {
        return buildErrorResult(
          "information_not_found",
          serviceInformationErrorsMessages,
          { id: idOrServiceId.toString() },
        );
      }

      return returnServiceInformationSuccess(
        "information_fetched",
        serviceInformationResponse(info),
      );
    } catch (error) {
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceInformationErrorsMessages, err.data);
    }
  }
}

export default new ShowServiceInformationService();
