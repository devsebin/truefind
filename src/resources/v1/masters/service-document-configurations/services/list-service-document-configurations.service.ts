import { listResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { Request } from "express";
import {
  returnServiceDocumentConfigSuccess,
  populateFields,
} from "../service-document-configurations.helper";
import { serviceDocumentConfigErrorsMessages } from "../service-document-configurations.messages";
import { serviceDocumentConfigListResponse } from "../service-document-configurations.response";
import ServiceDocumentConfigurationModel from "@/database/service-document-configuration/service-document-configuration-db-model";

class ListServiceDocumentConfigurationsService {
  public async execute(request: Request): Promise<any> {
    try {
      const query: any = { is_deleted: false };

      if (request.query.service_id) {
        query.service_id = request.query.service_id;
      }

      if (request.query.is_active !== undefined) {
        query.is_active = String(request.query.is_active) === "true";
      }

      const configs = await ServiceDocumentConfigurationModel.find(query).populate(populateFields);

      return returnServiceDocumentConfigSuccess(
        "config_list_fetched",
        serviceDocumentConfigListResponse(configs),
      );
    } catch (error) {
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceDocumentConfigErrorsMessages, err.data);
    }
  }
}

export default new ListServiceDocumentConfigurationsService();
