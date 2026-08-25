import { statusCodes } from "@/utils/definitions/constants/common";

export const serviceStatusesErrorsMessages = {
  created_by_format: {
    message: "created by format is invalid {0}",
    status: statusCodes.BadRequest,
  },
  updated_by_format: {
    message: "updated by format is invalid {0}",
    status: statusCodes.BadRequest,
  },
  invalid_id: {
    message: "Invalid service status id: {0}",
    status: statusCodes.BadRequest,
  },
  service_statuses_not_found: {
    message: "Service status not found with id: {0}",
    status: statusCodes.NotFound,
  },
  already_exists: {
    message: "Service status already exists with title/label: {0}",
    status: statusCodes.Conflict,
  },
  invalid_request: {
    message: "Invalid request",
    status: statusCodes.BadRequest,
  },
  already_activated: {
    message: "Service status is already activated with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  already_inactive: {
    message: "Service status is already inactive with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  confirmation_required: {
    message: "Confirmation required to delete service status",
    status: statusCodes.BadRequest,
  },
  already_deleted: {
    message: "Service status is already deleted with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  not_deleted: {
    message: "Service status is not deleted with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  no_change_detected: {
    message: "No change detected in service status with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  cannot_disable_default: {
    message: "Cannot disable default service status",
    status: statusCodes.Conflict,
  },
  cannot_delete_default: {
    message: "Cannot delete default service status",
    status: statusCodes.Conflict,
  },
};

export const serviceStatusesSuccessMessages = {
  service_statuses_created: {
    message: "Service status created successfully.",
    status: statusCodes.Created,
  },
  service_statuses_activate: {
    message: "Service status activated successfully.",
    status: statusCodes.OK,
  },
  service_statuses_deactivate: {
    message: "Service status deactivated successfully.",
    status: statusCodes.OK,
  },
  service_statuses_deleted: {
    message: "Service status deleted successfully.",
    status: statusCodes.OK,
  },
  service_statuses_listed: {
    message: "Service statuses listed successfully.",
    status: statusCodes.OK,
  },
  service_statuses_fetched: {
    message: "Service status details fetched successfully.",
    status: statusCodes.OK,
  },
  service_statuses_updated: {
    message: "Service status updated successfully.",
    status: statusCodes.OK,
  },
};
