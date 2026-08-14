import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { returnAreaConfigSuccess, throwAreaConfigError } from "../service-area-configurations.helper";
import { serviceAreaConfigErrorsMessages } from "../service-area-configurations.messages";
import SuburbModel from "@/database/suburbs/suburbs-db-model";
import ServiceCountryConfigurationModel from "@/database/service-country-configuration/service-country-configuration.model";
import ServiceAreaConfigurationModel from "@/database/service-area-configuration/service-area-configuration.model";
import { BaseServiceModel } from "@/database/services/services-db-model";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import { serviceTypes } from "@/utils/definitions/constants/service-types";

class ListAvailableServicesService {
  public async execute(
    suburbId: mongoose.Types.ObjectId
  ): Promise<SingleResponse | ErrorResponse> {
    try {
      const suburb = await SuburbModel.findOne({
        _id: suburbId,
        is_deleted: false,
      });

      if (!suburb) {
        throwAreaConfigError(
          "something_went_wrong",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: `Suburb not found with id ${suburbId}`,
            data: { suburbId },
          })
        );
      }

      const countryId = suburb.country_id;

      const services = (await BaseServiceModel.find({
        type: serviceTypes.Service,
        is_active: true,
        is_deleted: false,
      }).populate("icon")) as any[];

      const countryConfigs = await ServiceCountryConfigurationModel.find({
        country_id: countryId,
        is_deleted: false,
      }).populate(["currency_id", "unit_id"]);

      const countryConfigMap = new Map<string, any>();
      countryConfigs.forEach((config) => {
        countryConfigMap.set(config.service_id.toString(), config);
      });

      const areaConfigs = await ServiceAreaConfigurationModel.find({
        suburb_id: suburbId,
        is_deleted: false,
      });

      const areaConfigMap = new Map<string, any>();
      areaConfigs.forEach((config) => {
        areaConfigMap.set(config.service_id.toString(), config);
      });

      const getEffectiveValue = (
        propName: string,
        areaConfig: any,
        countryConfig: any,
        serviceDefault: any,
        defaultValue: any = null
      ) => {
        if (areaConfig && areaConfig.get(propName) !== undefined && areaConfig.get(propName) !== null) {
          return areaConfig.get(propName);
        }
        if (countryConfig && countryConfig.get(propName) !== undefined && countryConfig.get(propName) !== null) {
          return countryConfig.get(propName);
        }
        if (serviceDefault && serviceDefault.get(propName) !== undefined && serviceDefault.get(propName) !== null) {
          return serviceDefault.get(propName);
        }
        return defaultValue;
      };

      const availableServices: any[] = [];

      for (const service of services) {
        const serviceIdStr = service._id.toString();
        const countryConfig = countryConfigMap.get(serviceIdStr);
        const areaConfig = areaConfigMap.get(serviceIdStr);

        // Suburb must have country configuration to enable this service
        if (!countryConfig) {
          continue;
        }

        const is_active = getEffectiveValue("is_active", areaConfig, countryConfig, service, true);
        if (!is_active) {
          continue;
        }

        let currencyObj = null;
        if (countryConfig && countryConfig.currency_id) {
          const cur: any = countryConfig.currency_id;
          currencyObj = {
            id: cur.code,
            code: cur.code,
            symbol: cur.symbol,
          };
        }

        const required_licenses = getEffectiveValue("required_licenses", areaConfig, countryConfig, null, false);
        const is_callout_service = getEffectiveValue("is_callout_service", areaConfig, countryConfig, null, false);
        const is_fixed_price = getEffectiveValue("is_fixed_price", areaConfig, countryConfig, null, false);

        const price = getEffectiveValue("price", areaConfig, countryConfig, null, null);
        const unit_id = getEffectiveValue("unit_id", areaConfig, countryConfig, null, null);
        const minimum_unit_price = getEffectiveValue("minimum_unit_price", areaConfig, countryConfig, null, null);
        const maximum_unit_price = getEffectiveValue("maximum_unit_price", areaConfig, countryConfig, null, null);
        const call_out_fee = getEffectiveValue("call_out_fee", areaConfig, countryConfig, null, null);

        const estimated_time = getEffectiveValue("estimated_time", areaConfig, countryConfig, service, null);
        const estimated_time_unit = getEffectiveValue("estimated_time_unit", areaConfig, countryConfig, service, null);

        availableServices.push({
          id: service._id,
          name: service.name,
          description: service.description,
          icon: service.icon,
          currency: currencyObj,
          required_licenses,
          is_callout_service,
          is_fixed_price,
          price,
          unit_id,
          minimum_unit_price,
          maximum_unit_price,
          call_out_fee,
          estimated_time,
          estimated_time_unit,
        });
      }

      const responsePayload = {
        suburb: {
          id: suburb._id,
          name: suburb.name,
        },
        services: availableServices,
      };

      return returnAreaConfigSuccess("service_fetched", responsePayload);
    } catch (error) {
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceAreaConfigErrorsMessages, err.data);
    }
  }
}

export default new ListAvailableServicesService();
