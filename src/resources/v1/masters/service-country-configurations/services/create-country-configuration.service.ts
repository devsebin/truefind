import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { returnCountryConfigSuccess, populateFields, throwCountryConfigError } from "../service-country-configurations.helper";
import { serviceCountryConfigErrorsMessages } from "../service-country-configurations.messages";
import findServiceCountryHelperService from "../helpers/validators/find-service-country.helper.service";
import createCountryConfigurationHelperService from "../helpers/operations/create-country-configuration.helper.service";
import { toServiceCountryConfigurationDTO } from "../dto/service-country-configuration.dto";
import { serviceCountryConfigResponse } from "../service-country-configurations.response";

import findServiceHelperService from "@/resources/v1/masters/services/helpers/validators/find-service.helper.service";
import findCountryHelperService from "@/resources/v1/masters/countries/helpers/validators/find-country.helper.service";
import findCurrencyHelperService from "@/resources/v1/masters/currencies/helpers/validators/find-currencies.helper.service";
import findUnitsHelperService from "@/resources/v1/masters/units/helpers/validators/find-units.helper.service";

import { countryErrorsMessages } from "@/resources/v1/masters/countries/countries.messages";
import { currenciesErrorsMessages } from "@/resources/v1/masters/currencies/currencies.messages";
import { unitsErrorsMessages } from "@/resources/v1/masters/units/units.messages";

import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import { serviceTypes } from "@/utils/definitions/constants/service-types";

class CreateCountryConfigurationService {
  public async execute(
    request: Request
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = toServiceCountryConfigurationDTO(request.body);

    try {
      session.startTransaction();

      // check if service is exist or not and make sure that type is "service" 
      const service = await findServiceHelperService.findOne(
        { _id: body.service_id, is_deleted: false },
        session
      );
      if (!service) {
        throwCountryConfigError(
          "service_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Service not found",
            data: { service_id: body.service_id },
          })
        );
      }
      if (service.type !== serviceTypes.Service) {
        throwCountryConfigError(
          "invalid_service_type",
          ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
            message: "Service type must be 'service'",
            data: { service_id: body.service_id },
          })
        );
      }

      // check country is exist or not and check is_active is true
      await findCountryHelperService.execute(
        { _id: body.country_id, is_deleted: false, is_active: true } as any,
        countryErrorsMessages,
        {
          throwIfNotFound: true,
          lean: true,
          returnDocument: false,
          session,
        }
      );

      // check currency is exist or not and check is_active is true
      await findCurrencyHelperService.execute(
        { _id: body.currency_id, is_deleted: false, is_active: true } as any,
        currenciesErrorsMessages,
        {
          throwIfNotFound: true,
          lean: true,
          returnDocument: false,
          session,
        }
      );

      // check unit is exist or not and check is_active is true
      await findUnitsHelperService.execute(
        { _id: body.unit_id, is_deleted: false, is_active: true } as any,
        unitsErrorsMessages,
        {
          throwIfNotFound: true,
          lean: true,
          returnDocument: false,
          session,
        }
      );

      await findServiceCountryHelperService.execute(
        {
          service_id: body.service_id,
          country_id: body.country_id,
        },
        serviceCountryConfigErrorsMessages,
        {
          throwIfExists: true,
          returnDocument: false,
          session,
        }
      );




      const newConfig = await createCountryConfigurationHelperService.execute(
        body,
        session,
        dbTransactions,
        serviceCountryConfigErrorsMessages
      );

      await newConfig.populate(populateFields);

      await session.commitTransaction();

      return returnCountryConfigSuccess(
        "country_config_created",
        serviceCountryConfigResponse(newConfig),
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

export default new CreateCountryConfigurationService();
