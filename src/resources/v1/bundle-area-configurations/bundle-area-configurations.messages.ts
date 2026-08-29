import { statusCodes } from "@/utils/definitions/constants/common";

export const bundleAreaConfigErrorsMessages = {
  something_went_wrong: {
    message: "Something went wrong",
    status: statusCodes.InternalServerError,
  },
  country_configuration_not_found: {
    message: "Bundle country configuration not found.",
    status: statusCodes.NotFound,
  },
  country_not_found: {
    message: "Bundle country configuration not found.",
    status: statusCodes.NotFound,
  },
  suburb_not_found: {
    message: "Some suburbs were not found or are inactive.",
    status: statusCodes.NotFound,
  },
  suburbs_not_belong_to_country: {
    message: "Some suburbs do not belong to the selected country.",
    status: statusCodes.BadRequest,
  },
  area_config_not_found: {
    message: "Bundle area configuration not found.",
    status: statusCodes.NotFound,
  },
  area_config_already_exists: {
    message: "Bundle area configuration already exists for this bundle and suburb.",
    status: statusCodes.Conflict,
  },
  already_enabled: {
    message: "Bundle area configuration is already enabled.",
    status: statusCodes.Conflict,
  },
  already_disabled: {
    message: "Bundle area configuration is already disabled.",
    status: statusCodes.Conflict,
  },
  no_change_detected: {
    message: "No changes detected.",
    status: statusCodes.Conflict,
  },
  duplicate_suburbs_in_payload: {
    message: "Duplicate suburb_id found in the payload.",
    status: statusCodes.BadRequest,
  },
  currency_not_found: {
    message: "Currency not found.",
    status: statusCodes.NotFound,
  },
  units_not_found: {
    message: "Unit not found.",
    status: statusCodes.NotFound,
  },
};


export const bundleAreaConfigSuccessMessages = {
  area_config_created: {
    message: "Bundle area configuration created successfully.",
    status: statusCodes.Created,
  },
  area_config_fetched: {
    message: "Bundle area configuration fetched successfully.",
    status: statusCodes.OK,
  },
  area_config_updated: {
    message: "Bundle area configuration updated successfully.",
    status: statusCodes.OK,
  },
  area_config_enabled: {
    message: "Bundle area configuration enabled successfully.",
    status: statusCodes.OK,
  },
  area_config_disabled: {
    message: "Bundle area configuration disabled successfully.",
    status: statusCodes.OK,
  },
};
