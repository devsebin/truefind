import { statusCodes } from "@/utils/definitions/constants/common";

export const declaimerErrorsMessages = {
  something_went_wrong: {
    message: "Something went wrong while processing the declaimer.",
    status: statusCodes.InternalServerError,
  },
  country_not_found: {
    message: "The specified country code does not exist.",
    status: statusCodes.BadRequest,
  },
  declaimer_already_exists: {
    message: "A declaimer with the same language and country already exists.",
    status: statusCodes.Conflict,
  },
  declaimer_not_created: {
    message: "Failed to create the declaimer.",
    status: statusCodes.InternalServerError,
  },
  invalid_id: {
    message: "Invalid ID: {0}",
    status: statusCodes.BadRequest,
  },
  declaimer_not_found: {
    message: "Declaimer not found with ID: {0}",
    status: statusCodes.NotFound,
  },
  no_changes_detected: {
    message: "No changes detected in the update payload.",
    status: statusCodes.BadRequest,
  },
  declaimer_update_failed: {
    message: "Failed to update the declaimer.",
    status: statusCodes.InternalServerError,
  },
  already_activated: {
    message: "Declaimer is already activated.",
    status: statusCodes.Conflict,
  },
  already_inactive: {
    message: "Declaimer is already inactive.",
    status: statusCodes.Conflict,
  },
  already_deleted: {
    message: "Declaimer is already deleted.",
    status: statusCodes.Conflict,
  },
  confirmation_required: {
    message: "Confirmation required to delete declaimer.",
    status: statusCodes.Conflict,
  },
};

export const declaimerSuccessMessages = {
  declaimer_created: {
    message: "Declaimer created successfully.",
    status: statusCodes.Created,
  },
  declaimer_updated: {
    message: "Declaimer updated successfully.",
    status: statusCodes.OK,
  },
  declaimer_list_fetched: {
    message: "Declaimer list fetched successfully.",
    status: statusCodes.OK,
  },
  declaimer_fetched: {
    message: "Declaimer fetched successfully.",
    status: statusCodes.OK,
  },
  declaimer_activate: {
    message: "Declaimer activated successfully.",
    status: statusCodes.OK,
  },
  declaimer_deactivate: {
    message: "Declaimer deactivated successfully.",
    status: statusCodes.OK,
  },
  declaimer_deleted: {
    message: "Declaimer deleted successfully.",
    status: statusCodes.OK,
  },
};
