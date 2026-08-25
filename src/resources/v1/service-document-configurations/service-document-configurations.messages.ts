import { statusCodes } from "@/utils/definitions/constants/common";

export const serviceDocumentConfigErrorsMessages = {
  something_went_wrong: {
    message: "Something went wrong",
    status: statusCodes.InternalServerError,
  },
  invalid_id: {
    message: "Invalid ID provided.",
    status: statusCodes.BadRequest,
  },
  service_not_found: {
    message: "Service not found.",
    status: statusCodes.NotFound,
  },
  invalid_service_type: {
    message: "Service must be of type service.",
    status: statusCodes.BadRequest,
  },
  document_not_found: {
    message: "One or more service documents were not found.",
    status: statusCodes.NotFound,
  },
  config_not_found: {
    message: "Service document configuration not found.",
    status: statusCodes.NotFound,
  },
  config_already_exists: {
    message: "Service document configuration already exists for this service.",
    status: statusCodes.Conflict,
  },
  already_enabled: {
    message: "Service document configuration is already enabled.",
    status: statusCodes.Conflict,
  },
  already_disabled: {
    message: "Service document configuration is already disabled.",
    status: statusCodes.Conflict,
  },
  no_change_detected: {
    message: "No changes detected.",
    status: statusCodes.Conflict,
  },
  duplicate_documents_in_payload: {
    message: "Duplicate document_id entries are not allowed in required_documents.",
    status: statusCodes.BadRequest,
  },
  self_exemption_not_allowed: {
    message: "A required document cannot exempt itself.",
    status: statusCodes.BadRequest,
  },
  status_not_found: {
    message: "Required status not found.",
    status: statusCodes.NotFound,
  },
};

export const serviceDocumentConfigSuccessMessages = {
  config_created: {
    message: "Service document configuration created successfully.",
    status: statusCodes.Created,
  },
  config_fetched: {
    message: "Service document configuration fetched successfully.",
    status: statusCodes.OK,
  },
  config_list_fetched: {
    message: "Service document configurations fetched successfully.",
    status: statusCodes.OK,
  },
  config_updated: {
    message: "Service document configuration updated successfully.",
    status: statusCodes.OK,
  },
  config_deleted: {
    message: "Service document configuration deleted successfully.",
    status: statusCodes.OK,
  },
  config_enabled: {
    message: "Service document configuration enabled successfully.",
    status: statusCodes.OK,
  },
  config_disabled: {
    message: "Service document configuration disabled successfully.",
    status: statusCodes.OK,
  },
};
