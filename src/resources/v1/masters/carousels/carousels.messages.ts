import { statusCodes } from "@/utils/definitions/constants/common";

export const carouselsErrorsMessages = {
  created_by_format: {
    message: "created by format is invalid {0}",
    status: statusCodes.BadRequest,
  },
  updated_by_format: {
    message: "updated by format is invalid {0}",
    status: statusCodes.BadRequest,
  },
  invalid_id: {
    message: "Invalid carousel id: {0}",
    status: statusCodes.BadRequest,
  },
  carousels_not_found: {
    message: "Carousel not found with id: {0}",
    status: statusCodes.NotFound,
  },
  already_exists: {
    message: "Carousel already exists with title: {0}",
    status: statusCodes.Conflict,
  },
  invalid_request: {
    message: "Invalid request",
    status: statusCodes.BadRequest,
  },
  already_activated: {
    message: "Carousel is already activated with id: {0}",
    status: statusCodes.BadRequest,
  },
  already_inactive: {
    message: "Carousel is already inactive with id: {0}",
    status: statusCodes.BadRequest,
  },
  confirmation_required: {
    message: "Confirmation required to delete carousel",
    status: statusCodes.BadRequest,
  },
  already_deleted: {
    message: "Carousel is already deleted with id: {0}",
    status: statusCodes.BadRequest,
  },
  not_deleted: {
    message: "Carousel is not deleted with id: {0}",
    status: statusCodes.BadRequest,
  },
  no_change_detected: {
    message: "No change detected in carousel with id: {0}",
    status: statusCodes.BadRequest,
  },
  button_and_redeem_code_conflict: {
    message: "Both button and redeemCode cannot be present at the same time",
    status: statusCodes.BadRequest,
  },
};

export const carouselsSuccessMessages = {
  carousels_created: {
    message: "Carousel created successfully.",
    status: statusCodes.Created,
  },
  carousels_activate: {
    message: "Carousel activated successfully.",
    status: statusCodes.OK,
  },
  carousels_deactivate: {
    message: "Carousel deactivated successfully.",
    status: statusCodes.OK,
  },
  carousels_deleted: {
    message: "Carousel deleted successfully.",
    status: statusCodes.OK,
  },
  carousels_listed: {
    message: "Carousels listed successfully.",
    status: statusCodes.OK,
  },
  carousels_fetched: {
    message: "Carousel details fetched successfully.",
    status: statusCodes.OK,
  },
  carousels_updated: {
    message: "Carousel updated successfully.",
    status: statusCodes.OK,
  },
};
