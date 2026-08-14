import { statusCodes } from "@/utils/definitions/constants/common";

export const serviceAreaConfigErrorsMessages = {
  something_went_wrong: {
    message: "Something went wrong",
    status: statusCodes.InternalServerError,
  },
  category_not_found: {
    message: "Service not found with id {0}.",
    status: statusCodes.BadRequest,
  },
  service_not_found: {
    message: "Service not found.",
    status: statusCodes.NotFound,
  },
  suburb_not_found: {
    message: "Suburb not found.",
    status: statusCodes.NotFound,
  },
  units_not_found: {
    message: "Unit not found.",
    status: statusCodes.NotFound,
  },
  area_config_already_exists: {
    message: "Service area configuration already exists for this service and suburb.",
    status: statusCodes.Conflict,
  },
  area_config_not_found: {
    message: "Service area configuration not found.",
    status: statusCodes.NotFound,
  },
  already_enabled: {
    message: "Service area configuration is already enabled.",
    status: statusCodes.Conflict,
  },
  already_disabled: {
    message: "Service area configuration is already disabled.",
    status: statusCodes.Conflict,
  },
  no_change_detected: {
    message: "No changes detected.",
    status: statusCodes.Conflict,
  },
  invalid_service_type: {
    message: "Service must be of type service.",
    status: statusCodes.BadRequest,
  },
  duplicate_suburbs_in_payload: {
    message: "Duplicate suburbs found in the payload.",
    status: statusCodes.BadRequest,
  },
};

export const serviceAreaConfigSuccessMessages = {
  service_fetched: {
    message: "Service fetched successfully.",
    status: statusCodes.OK,
  },
  area_config_created: {
    message: "Area configuration overrides created successfully.",
    status: statusCodes.Created,
  },
  area_config_fetched: {
    message: "Area configuration overrides fetched successfully.",
    status: statusCodes.OK,
  },
  area_config_updated: {
    message: "Area configuration overrides updated successfully.",
    status: statusCodes.OK,
  },
  area_config_enabled: {
    message: "Area configuration overrides enabled successfully.",
    status: statusCodes.OK,
  },
  area_config_disabled: {
    message: "Area configuration overrides disabled successfully.",
    status: statusCodes.OK,
  },
};
