import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { serviceStatusesErrorsMessages } from "../service-statuses.messages";
import findServiceStatusesHelperService from "../helpers/validators/find-service-statuses.helper.service";
import { populateFields, serviceStatusesPayload } from "../service-statuses.helper";
import { serviceStatusesResponse } from "../service-statuses.response";

class showServiceStatusesService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];

    try {
      const serviceStatus = await findServiceStatusesHelperService.execute(
        { _id: id },
        serviceStatusesErrorsMessages,
        {
          lean: true,
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
        },
      );

      return serviceStatusesPayload(
        "service_statuses_fetched",
        serviceStatusesResponse(serviceStatus[0]),
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        serviceStatusesErrorsMessages,
        err.data,
      );
    }
  }
}

export default new showServiceStatusesService();
