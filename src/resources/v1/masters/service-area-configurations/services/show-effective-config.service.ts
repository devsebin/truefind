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

class ShowEffectiveConfigService {
  public async execute(
    serviceId: mongoose.Types.ObjectId,
    suburbId: mongoose.Types.ObjectId
  ): Promise<SingleResponse | ErrorResponse> {
    try {
      const service = await BaseServiceModel.findOne({
        _id: serviceId,
        is_deleted: false,
      });

      if (!service) {
        throwAreaConfigError(
          "category_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: `Service not found with id ${serviceId}`,
            data: { serviceId },
          })
        );
      }

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

      const countryConfig = await ServiceCountryConfigurationModel.findOne({
        service_id: serviceId,
        country_id: suburb.country_id,
        is_deleted: false,
      }).populate(["currency_id", "unit_id"]);

      const areaConfig = await ServiceAreaConfigurationModel.findOne({
        service_id: serviceId,
        suburb_id: suburbId,
        is_deleted: false,
      });

      const properties = [
        "required_licenses",
        "is_callout_service",
        "is_fixed_price",
        "price",
        "unit_id",
        "minimum_unit_price",
        "maximum_unit_price",
        "call_out_fee",
        "estimated_time",
        "estimated_time_unit",
        "is_active"
      ];

      const mergedConfig: Record<string, { value: any; source: string }> = {};

      properties.forEach((prop) => {
        if (areaConfig && areaConfig.get(prop) !== undefined && areaConfig.get(prop) !== null) {
          mergedConfig[prop] = { value: areaConfig.get(prop), source: "area" };
        } else if (countryConfig && countryConfig.get(prop) !== undefined && countryConfig.get(prop) !== null) {
          mergedConfig[prop] = { value: countryConfig.get(prop), source: "country" };
        } else if (service && service.get(prop) !== undefined && service.get(prop) !== null) {
          mergedConfig[prop] = { value: service.get(prop), source: "global" };
        } else {
          let defaultValue: any = null;
          if (prop === "required_licenses") defaultValue = false;
          if (prop === "is_callout_service") defaultValue = false;
          if (prop === "is_fixed_price") defaultValue = false;
          if (prop === "is_active") defaultValue = true;

          mergedConfig[prop] = { value: defaultValue, source: "default" };
        }
      });

      let currencyObj = null;
      if (countryConfig && countryConfig.currency_id) {
        const cur: any = countryConfig.currency_id;
        currencyObj = {
          id: cur.code,
          code: cur.code,
          symbol: cur.symbol,
        };
      }

      const responsePayload = {
        service: {
          id: service._id,
          name: service.name,
          description: service.description,
          icon: service.icon,
        },
        suburb: {
          id: suburb._id,
          name: suburb.name,
        },
        currency: currencyObj,
        effective_config: mergedConfig,
      };

      return returnAreaConfigSuccess("area_config_fetched", responsePayload);
    } catch (error) {
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceAreaConfigErrorsMessages, err.data);
    }
  }
}

export default new ShowEffectiveConfigService();
