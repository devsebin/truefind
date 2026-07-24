import { statusCodes } from "@/utils/definitions/constants/common";

export const statusesErrorsMessages = {
  created_by_format: {
    message: "created by format is invalid {0}",
    status: statusCodes.BadRequest,
  },
  updated_by_format: {
    message: "updated by format is invalid {0}",
    status: statusCodes.BadRequest,
  },
  invalid_id: {
    message: "Invalid status id: {0}",
    status: statusCodes.BadRequest,
  },
  status_not_found: {
    message: "Status not found with id: {0}",
    status: statusCodes.NotFound,
  },
  already_exists: {
    message: "Status already exists with title: {0}",
    status: statusCodes.Conflict,
  },
  invalid_request: {
    message: "Invalid request",
    status: statusCodes.BadRequest,
  },
  already_activated: {
    message: "Status is already activated with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  already_inactive: {
    message: "Status is already inactive with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  confirmation_required: {
    message: "Confirmation required to delete status",
    status: statusCodes.BadRequest,
  },
  already_deleted: {
    message: "Status is already deleted with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  not_deleted: {
    message: "Status is not deleted with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  no_change_detected: {
    message: "No change detected in status with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  status_is_default: {
    message: "status is default with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
};

export const statusesSuccessMessages = {
  status_created: {
    message: "Status created successfully.",
    status: statusCodes.Created,
  },
  status_activate: {
    message: "Status activated successfully.",
    status: statusCodes.OK,
  },
  status_deactivate: {
    message: "Status deactivated successfully.",
    status: statusCodes.OK,
  },
  status_deleted: {
    message: "Status deleted successfully.",
    status: statusCodes.OK,
  },
  status_listed: {
    message: "Statuses listed successfully.",
    status: statusCodes.OK,
  },
  status_fetched: {
    message: "Status details fetched successfully.",
    status: statusCodes.OK,
  },
  status_updated: {
    message: "Status updated successfully.",
    status: statusCodes.OK,
  },
};
