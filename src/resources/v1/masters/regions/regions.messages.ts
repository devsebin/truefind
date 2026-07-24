import { statusCodes } from "@/utils/definitions/constants/common";

export const regionErrorsMessages = {
    created_by_format: {
        message: "created by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    updated_by_format: {
        message: "updated by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    invalid_id: {
        message: "Invalid region id: {0}",
        status: statusCodes.BadRequest,
    },
    region_not_found: {
        message: "Region not found with id: {0}",
        status: statusCodes.NotFound,
    },
    already_exists: {
        message: "Region already exists with name/code: {0}",
        status: statusCodes.Conflict,
    },
    invalid_request: {
        message: "Invalid request",
        status: statusCodes.BadRequest,
    },
    already_activated: {
        message: "Region is already activated with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    already_inactive: {
        message: "Region is already inactive with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    confirmation_required: {
        message: "Confirmation required to delete region",
        status: statusCodes.BadRequest,
    },
    already_deleted: {
        message: "Region is already deleted with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    not_deleted: {
        message: "Region is not deleted with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    no_change_detected: {
        message: "No change detected in region with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    country_not_found: {
        message: "Country not found with id: {0}",
        status: statusCodes.NotFound,
    },
};

export const regionSuccessMessages = {
    region_created: {
        message: "Region created successfully.",
        status: statusCodes.Created,
    },
    region_activate: {
        message: "Region activated successfully.",
        status: statusCodes.OK,
    },
    region_deactivate: {
        message: "Region deactivated successfully.",
        status: statusCodes.OK,
    },
    region_deleted: {
        message: "Region deleted successfully.",
        status: statusCodes.OK,
    },
    region_listed: {
        message: "Regions listed successfully.",
        status: statusCodes.OK,
    },
    region_fetched: {
        message: "Region details fetched successfully.",
        status: statusCodes.OK,
    },
    region_updated: {
        message: "Region updated successfully.",
        status: statusCodes.OK,
    },
};
