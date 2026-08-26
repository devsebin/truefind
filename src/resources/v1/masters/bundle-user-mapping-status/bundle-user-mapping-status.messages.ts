import { statusCodes } from "@/utils/definitions/constants/common";

export const bundleUserMappingStatusErrorsMessages = {
  created_by_format: {
    message: "created by format is invalid {0}",
    status: statusCodes.BadRequest,
  },
  updated_by_format: {
    message: "updated by format is invalid {0}",
    status: statusCodes.BadRequest,
  },
  invalid_id: {
    message: "Invalid bundle user mapping status id: {0}",
    status: statusCodes.BadRequest,
  },
  bundle_user_mapping_status_not_found: {
    message: "Bundle user mapping status not found with id: {0}",
    status: statusCodes.NotFound,
  },
  already_exists: {
    message: "Bundle user mapping status already exists with title/label: {0}",
    status: statusCodes.Conflict,
  },
  invalid_request: {
    message: "Invalid request",
    status: statusCodes.BadRequest,
  },
  already_activated: {
    message: "Bundle user mapping status is already activated with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  already_inactive: {
    message: "Bundle user mapping status is already inactive with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  confirmation_required: {
    message: "Confirmation required to delete bundle user mapping status",
    status: statusCodes.BadRequest,
  },
  already_deleted: {
    message: "Bundle user mapping status is already deleted with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  not_deleted: {
    message: "Bundle user mapping status is not deleted with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  no_change_detected: {
    message: "No change detected in bundle user mapping status with title: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  cannot_disable_default: {
    message: "Cannot disable default bundle user mapping status",
    status: statusCodes.Conflict,
  },
  cannot_delete_default: {
    message: "Cannot delete default bundle user mapping status",
    status: statusCodes.Conflict,
  },
};

export const bundleUserMappingStatusSuccessMessages = {
  bundle_user_mapping_status_created: {
    message: "Bundle user mapping status created successfully.",
    status: statusCodes.Created,
  },
  bundle_user_mapping_status_activate: {
    message: "Bundle user mapping status activated successfully.",
    status: statusCodes.OK,
  },
  bundle_user_mapping_status_deactivate: {
    message: "Bundle user mapping status deactivated successfully.",
    status: statusCodes.OK,
  },
  bundle_user_mapping_status_deleted: {
    message: "Bundle user mapping status deleted successfully.",
    status: statusCodes.OK,
  },
  bundle_user_mapping_status_listed: {
    message: "Bundle user mapping statuses listed successfully.",
    status: statusCodes.OK,
  },
  bundle_user_mapping_status_fetched: {
    message: "Bundle user mapping status details fetched successfully.",
    status: statusCodes.OK,
  },
  bundle_user_mapping_status_updated: {
    message: "Bundle user mapping status updated successfully.",
    status: statusCodes.OK,
  },
};
