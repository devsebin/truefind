import { statusCodes } from "@/utils/definitions/constants/common";

export const serviceCountryConfigErrorsMessages = {
  something_went_wrong: {
    message: "Something went wrong",
    status: statusCodes.InternalServerError,
  },
  country_config_already_exists: {
    message: "Country configuration already exists for this service and country.",
    status: statusCodes.Conflict,
  },
  service_not_found: {
    message: "Service not found.",
    status: statusCodes.NotFound,
  },
  country_not_found: {
    message: "Country not found.",
    status: statusCodes.NotFound,
  },
  currency_not_found: {
    message: "Currency not found.",
    status: statusCodes.NotFound,
  },
  units_not_found: {
    message: "Unit not found.",
    status: statusCodes.NotFound,
  },
  invalid_service_type: {
    message: "Service must be of type service.",
    status: statusCodes.BadRequest,
  },
};

export const serviceCountryConfigSuccessMessages = {
  country_config_created: {
    message: "Country configuration created successfully.",
    status: statusCodes.Created,
  },
  country_config_updated: {
    message: "Country configuration updated successfully.",
    status: statusCodes.OK,
  },
  country_config_deleted: {
    message: "Country configuration deleted successfully.",
    status: statusCodes.OK,
  },
  country_config_fetched: {
    message: "Country configuration fetched successfully.",
    status: statusCodes.OK,
  },
};
