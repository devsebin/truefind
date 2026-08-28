import { statusCodes } from "@/utils/definitions/constants/common";

export const bundlesErrorsMessages = {
  created_by_format: {
    message: "created by format is invalid {0}",
    status: statusCodes.BadRequest,
  },
  updated_by_format: {
    message: "updated by format is invalid {0}",
    status: statusCodes.BadRequest,
  },
  invalid_id: {
    message: "Invalid bundle id: {0}",
    status: statusCodes.BadRequest,
  },
  bundle_not_found: {
    message: "Bundle not found with id: {0}",
    status: statusCodes.NotFound,
  },
  already_exists: {
    message: "Bundle already exists with code/name: {0}",
    status: statusCodes.Conflict,
  },
  code_already_exists: {
    message: "Bundle code already exists: {0}",
    status: statusCodes.Conflict,
  },
  icon_not_found: {
    message: "Icon document not found with id: {0}",
    status: statusCodes.NotFound,
  },
  bundle_statuses_not_found: {
    message: "Bundle status not found with id: {0}",
    status: statusCodes.NotFound,
  },
  invalid_request: {
    message: "Invalid request",
    status: statusCodes.BadRequest,
  },
  already_activated: {
    message: "Bundle is already activated with code: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  already_inactive: {
    message: "Bundle is already inactive with code: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  confirmation_required: {
    message: "Confirmation required to delete bundle",
    status: statusCodes.BadRequest,
  },
  already_deleted: {
    message: "Bundle is already deleted with code: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  not_deleted: {
    message: "Bundle is not deleted with code: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  no_change_detected: {
    message: "No change detected in bundle with code: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  already_approved: {
    message: "Bundle is already approved with code: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  bundle_not_approvable: {
    message: "Bundle is not in an approvable state with code: {0} and id: {1}",
    status: statusCodes.BadRequest,
  },
  file_not_found: {
    message: "File not found with id: {0}",
    status: statusCodes.NotFound,
  },
};

export const bundlesSuccessMessages = {
  bundle_created: {
    message: "Bundle created successfully",
    status: statusCodes.Created,
  },
  bundle_fetched: {
    message: "Bundle fetched successfully",
    status: statusCodes.OK,
  },
  bundles_listed: {
    message: "Bundles listed successfully",
    status: statusCodes.OK,
  },
  bundle_updated: {
    message: "Bundle updated successfully",
    status: statusCodes.OK,
  },
  bundle_deleted: {
    message: "Bundle deleted successfully",
    status: statusCodes.OK,
  },
  bundle_activate: {
    message: "Bundle activated successfully",
    status: statusCodes.OK,
  },
  bundle_deactivate: {
    message: "Bundle deactivated successfully",
    status: statusCodes.OK,
  },
  bundle_approved: {
    message: "Bundle approved successfully",
    status: statusCodes.OK,
  },
};
