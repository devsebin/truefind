import { listResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { Request } from "express";
import {
  returnServiceInformationSuccess,
  populateFields,
} from "../service-informations.helper";
import { serviceInformationErrorsMessages } from "../service-informations.messages";
import { serviceInformationListResponse } from "../service-informations.response";
import ServiceInformationModel from "@/database/service-informations/service-information-db-model";

class ListServiceInformationsService {
  public async execute(request: Request): Promise<any> {
    try {
      const query: any = { is_deleted: false };

      if (request.query.service_id) {
        query.service_id = request.query.service_id;
      }

      if (request.query.is_active !== undefined) {
        query.is_active = String(request.query.is_active) === "true";
      }

      const infos = await ServiceInformationModel.find(query).populate(populateFields);

      return returnServiceInformationSuccess(
        "information_list_fetched",
        serviceInformationListResponse(infos),
      );
    } catch (error) {
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceInformationErrorsMessages, err.data);
    }
  }
}

export default new ListServiceInformationsService();
