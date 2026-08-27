import { statusCodes } from "@/utils/definitions/constants/common";

export const bundleLocationConfigStatusesErrorsMessages = {
  created_by_format: {
    message: "created by format is invalid {0}",
    status: statusCodes.BadRequest,
  },
  updated_by_format: {
    message: "updated by format is invalid {0}",
    status: statusCodes.BadRequest,
  },
  invalid_id: {
    message: "Invalid bundle location config status id: {0}",
    status: statusCodes.BadRequest,
  },
  bundle_location_config_statuses_not_found: {
    message: "Bundle location config status not found with id: {0}",
    status: statusCodes.NotFound,
  },
  already_exists: {
    message: "Bundle location config status already exists with title/label: {0}",
    status: statusCodes.Conflict,
  },
  invalid_request: {
    message: "Invalid request",
    status: statusCodes.BadRequest,
  },
  already_activated: {
    message:
      "Bundle location config status is already activated with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  already_inactive: {
    message:
      "Bundle location config status is already inactive with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  confirmation_required: {
    message: "Confirmation required to delete bundle location config status",
    status: statusCodes.BadRequest,
  },
  already_deleted: {
    message:
      "Bundle location config status is already deleted with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  not_deleted: {
    message:
      "Bundle location config status is not deleted with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  no_change_detected: {
    message:
      "No change detected in bundle location config status with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  cannot_disable_default: {
    message: "Cannot disable default bundle location config status",
    status: statusCodes.Conflict,
  },
  cannot_delete_default: {
    message: "Cannot delete default bundle location config status",
    status: statusCodes.Conflict,
  },
};

export const bundleLocationConfigStatusesSuccessMessages = {
  bundle_location_config_statuses_created: {
    message: "Bundle location config status created successfully.",
    status: statusCodes.Created,
  },
  bundle_location_config_statuses_activate: {
    message: "Bundle location config status activated successfully.",
    status: statusCodes.OK,
  },
  bundle_location_config_statuses_deactivate: {
    message: "Bundle location config status deactivated successfully.",
    status: statusCodes.OK,
  },
  bundle_location_config_statuses_deleted: {
    message: "Bundle location config status deleted successfully.",
    status: statusCodes.OK,
  },
  bundle_location_config_statuses_listed: {
    message: "Bundle location config statuses listed successfully.",
    status: statusCodes.OK,
  },
  bundle_location_config_statuses_fetched: {
    message: "Bundle location config status details fetched successfully.",
    status: statusCodes.OK,
  },
  bundle_location_config_statuses_updated: {
    message: "Bundle location config status updated successfully.",
    status: statusCodes.OK,
  },
};
