import { statusCodes } from "@/utils/definitions/constants/common";

export const serviceUserConfigErrorsMessages = {
  invalid_id: {
    message: "Invalid configuration id: {0}",
    status: statusCodes.BadRequest,
  },
  configuration_not_found: {
    message: "Service user configuration not found with id: {0}",
    status: statusCodes.NotFound,
  },
  already_exists: {
    message: "Service user configuration already exists for this task",
    status: statusCodes.Conflict,
  },
  invalid_request: {
    message: "Invalid request",
    status: statusCodes.BadRequest,
  },
  already_activated: {
    message: "Service user configuration is already active with id: {0}",
    status: statusCodes.BadRequest,
  },
  already_inactive: {
    message: "Service user configuration is already inactive with id: {0}",
    status: statusCodes.BadRequest,
  },
  confirmation_required: {
    message: "Confirmation required to delete service user configuration",
    status: statusCodes.BadRequest,
  },
  already_deleted: {
    message: "Service user configuration is already deleted with id: {0}",
    status: statusCodes.BadRequest,
  },
  not_deleted: {
    message: "Service user configuration is not deleted with id: {0}",
    status: statusCodes.BadRequest,
  },
  no_change_detected: {
    message: "No change detected in service user configuration with id: {0}",
    status: statusCodes.BadRequest,
  },
  user_not_found: {
    message: "User not found with id: {0}",
    status: statusCodes.NotFound,
  },
  service_not_found: {
    message: "Service not found with id: {0}",
    status: statusCodes.NotFound,
  },
  services_not_found: {
    message: "Some services were not found or are inactive",
    status: statusCodes.NotFound,
  },
  duplicate_services_in_payload: {
    message: "Duplicate service IDs found in the payload",
    status: statusCodes.BadRequest,
  },
  unauthorized: {
    message: "Unauthorized to perform this action",
    status: statusCodes.Unauthorized,
  },
  forbidden: {
    message: "Forbidden: Only admins can specify a target user ID",
    status: statusCodes.Forbidden,
  },
};

export const serviceUserConfigSuccessMessages = {
  service_user_config_created: {
    message: "Service user configuration created successfully.",
    status: statusCodes.Created,
  },
  service_user_configs_bulk_created: {
    message: "Service user configurations stored successfully.",
    status: statusCodes.Created,
  },
  service_user_config_activated: {
    message: "Service user configuration activated successfully.",
    status: statusCodes.OK,
  },
  service_user_config_deactivated: {
    message: "Service user configuration deactivated successfully.",
    status: statusCodes.OK,
  },
  service_user_config_deleted: {
    message: "Service user configuration deleted successfully.",
    status: statusCodes.OK,
  },
  service_user_configs_listed: {
    message: "Service user configurations listed successfully.",
    status: statusCodes.OK,
  },
  service_user_config_fetched: {
    message: "Service user configuration details fetched successfully.",
    status: statusCodes.OK,
  },
  service_user_config_updated: {
    message: "Service user configuration updated successfully.",
    status: statusCodes.OK,
  },
};
