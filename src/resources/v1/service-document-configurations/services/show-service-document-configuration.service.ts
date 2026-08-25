import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import mongoose from "mongoose";
import {
  returnServiceDocumentConfigSuccess,
  throwServiceDocumentConfigError,
  populateFields,
} from "../service-document-configurations.helper";
import { serviceDocumentConfigErrorsMessages } from "../service-document-configurations.messages";
import { serviceDocumentConfigResponse } from "../service-document-configurations.response";
import findServiceDocumentConfigurationHelperService from "../helpers/validators/find-service-document-configuration.helper.service";
import ServiceDocumentConfigurationModel from "@/database/service-document-configuration/service-document-configuration-db-model";

class ShowServiceDocumentConfigurationService {
  public async execute(
    idOrServiceId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    try {
      // Find either by _id or service_id
      let config = await ServiceDocumentConfigurationModel.findOne({
        $or: [{ _id: idOrServiceId }, { service_id: idOrServiceId }],
        is_deleted: false,
      }).populate(populateFields);

      if (!config) {
        return buildErrorResult(
          "config_not_found",
          serviceDocumentConfigErrorsMessages,
          { id: idOrServiceId.toString() },
        );
      }

      return returnServiceDocumentConfigSuccess(
        "config_fetched",
        serviceDocumentConfigResponse(config),
      );
    } catch (error) {
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceDocumentConfigErrorsMessages, err.data);
    }
  }
}

export default new ShowServiceDocumentConfigurationService();
