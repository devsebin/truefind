import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { returnCountryConfigSuccess, populateFields } from "../service-country-configurations.helper";
import { serviceCountryConfigErrorsMessages } from "../service-country-configurations.messages";
import findServiceCountryHelperService from "../helpers/validators/find-service-country.helper.service";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { serviceCountryConfigListResponse } from "../service-country-configurations.response";

class ListCountryConfigurationService {
  public async execute(
    request: Request
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const { service_id, country_id } = request.query;
      const query: any = {};

      if (service_id) {
        query.service_id = new mongoose.Types.ObjectId(service_id as string);
      }
      if (country_id) {
        query.country_id = new mongoose.Types.ObjectId(country_id as string);
      }

      const configs = await findServiceCountryHelperService.execute(
        query,
        serviceCountryConfigErrorsMessages,
        {
          populate: populateFields,
          session,
        }
      );

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceCountryConfigurations,
          apiMethods.GET,
          operationTypes.Read,
          configs
        )
      );

      await session.commitTransaction();

      return returnCountryConfigSuccess(
        "country_config_fetched",
        serviceCountryConfigListResponse(configs),
        dbTransactions
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceCountryConfigErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new ListCountryConfigurationService();
