import { statusCodes } from "@/utils/definitions/constants/common";

export const serviceUserDocConfigErrorsMessages = {
  invalid_id: {
    message: "Invalid configuration id: {0}",
    status: statusCodes.BadRequest,
  },
  configuration_not_found: {
    message: "Service user document configuration not found with id: {0}",
    status: statusCodes.NotFound,
  },
  already_exists: {
    message: "Service user document configuration already exists for this requirement",
    status: statusCodes.Conflict,
  },
  invalid_request: {
    message: "Invalid request",
    status: statusCodes.BadRequest,
  },
  already_activated: {
    message: "Service user document configuration is already active with id: {0}",
    status: statusCodes.BadRequest,
  },
  already_inactive: {
    message: "Service user document configuration is already inactive with id: {0}",
    status: statusCodes.BadRequest,
  },
  confirmation_required: {
    message: "Confirmation required to delete service user document configuration",
    status: statusCodes.BadRequest,
  },
  already_deleted: {
    message: "Service user document configuration is already deleted with id: {0}",
    status: statusCodes.BadRequest,
  },
  not_deleted: {
    message: "Service user document configuration is not deleted with id: {0}",
    status: statusCodes.BadRequest,
  },
  no_change_detected: {
    message: "No change detected in service user document configuration with id: {0}",
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
  document_requirement_not_found: {
    message: "Document requirement not found with id: {0}",
    status: statusCodes.NotFound,
  },
  unauthorized: {
    message: "Unauthorized to perform this action",
    status: statusCodes.Unauthorized,
  },
  forbidden: {
    message: "Forbidden: Only admins can specify a target user ID",
    status: statusCodes.Forbidden,
  },
  employee_only: {
    message: "Only employees are authorized to perform this action",
    status: statusCodes.Forbidden,
  },
  document_not_found: {
    message: "Uploaded document not found with id: {0}",
    status: statusCodes.NotFound,
  },
  no_upload_found: {
    message: "No upload record found to review for service user document configuration",
    status: statusCodes.BadRequest,
  },
  approval_requirements_failed: {
    message: "Document cannot be approved: all data requirements must be satisfied",
    status: statusCodes.BadRequest,
  },
  rejection_reason_required: {
    message: "Rejection reason is mandatory",
    status: statusCodes.BadRequest,
  },
};

export const serviceUserDocConfigSuccessMessages = {
  service_user_doc_config_created: {
    message: "Service user document configuration created successfully.",
    status: statusCodes.Created,
  },
  service_user_doc_config_activated: {
    message: "Service user document configuration activated successfully.",
    status: statusCodes.OK,
  },
  service_user_doc_config_deactivated: {
    message: "Service user document configuration deactivated successfully.",
    status: statusCodes.OK,
  },
  service_user_doc_config_deleted: {
    message: "Service user document configuration deleted successfully.",
    status: statusCodes.OK,
  },
  service_user_doc_configs_listed: {
    message: "Service user document configurations listed successfully.",
    status: statusCodes.OK,
  },
  service_user_doc_config_fetched: {
    message: "Service user document configuration details fetched successfully.",
    status: statusCodes.OK,
  },
  service_user_doc_config_updated: {
    message: "Service user document configuration updated successfully.",
    status: statusCodes.OK,
  },
  service_user_doc_uploaded: {
    message: "Document uploaded successfully for review.",
    status: statusCodes.OK,
  },
  service_user_doc_approved: {
    message: "Service user document configuration approved successfully.",
    status: statusCodes.OK,
  },
  service_user_doc_rejected: {
    message: "Service user document configuration rejected successfully.",
    status: statusCodes.OK,
  },
};
