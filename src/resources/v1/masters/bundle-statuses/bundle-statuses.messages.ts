import { statusCodes } from "@/utils/definitions/constants/common";

export const bundleStatusesErrorsMessages = {
  created_by_format: {
    message: "created by format is invalid {0}",
    status: statusCodes.BadRequest,
  },
  updated_by_format: {
    message: "updated by format is invalid {0}",
    status: statusCodes.BadRequest,
  },
  invalid_id: {
    message: "Invalid bundle status id: {0}",
    status: statusCodes.BadRequest,
  },
  bundle_statuses_not_found: {
    message: "Bundle status not found with id: {0}",
    status: statusCodes.NotFound,
  },
  already_exists: {
    message: "Bundle status already exists with title/label: {0}",
    status: statusCodes.Conflict,
  },
  invalid_request: {
    message: "Invalid request",
    status: statusCodes.BadRequest,
  },
  already_activated: {
    message: "Bundle status is already activated with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  already_inactive: {
    message: "Bundle status is already inactive with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  confirmation_required: {
    message: "Confirmation required to delete bundle status",
    status: statusCodes.BadRequest,
  },
  already_deleted: {
    message: "Bundle status is already deleted with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  not_deleted: {
    message: "Bundle status is not deleted with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  no_change_detected: {
    message: "No change detected in bundle status with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  cannot_disable_default: {
    message: "Cannot disable default bundle status",
    status: statusCodes.Conflict,
  },
  cannot_delete_default: {
    message: "Cannot delete default bundle status",
    status: statusCodes.Conflict,
  },
};

export const bundleStatusesSuccessMessages = {
  bundle_statuses_created: {
    message: "Bundle status created successfully.",
    status: statusCodes.Created,
  },
  bundle_statuses_activate: {
    message: "Bundle status activated successfully.",
    status: statusCodes.OK,
  },
  bundle_statuses_deactivate: {
    message: "Bundle status deactivated successfully.",
    status: statusCodes.OK,
  },
  bundle_statuses_deleted: {
    message: "Bundle status deleted successfully.",
    status: statusCodes.OK,
  },
  bundle_statuses_listed: {
    message: "Bundle statuses listed successfully.",
    status: statusCodes.OK,
  },
  bundle_statuses_fetched: {
    message: "Bundle status details fetched successfully.",
    status: statusCodes.OK,
  },
  bundle_statuses_updated: {
    message: "Bundle status updated successfully.",
    status: statusCodes.OK,
  },
};
