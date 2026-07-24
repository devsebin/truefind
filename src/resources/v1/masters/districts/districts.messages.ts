import { statusCodes } from "@/utils/definitions/constants/common";

export const districtErrorsMessages = {
    created_by_format: {
        message: "created by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    updated_by_format: {
        message: "updated by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    invalid_id: {
        message: "Invalid district id: {0}",
        status: statusCodes.BadRequest,
    },
    district_not_found: {
        message: "District not found with id: {0}",
        status: statusCodes.NotFound,
    },
    already_exists: {
        message: "District already exists with name/code: {0}",
        status: statusCodes.Conflict,
    },
    invalid_request: {
        message: "Invalid request",
        status: statusCodes.BadRequest,
    },
    already_activated: {
        message: "District is already activated with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    already_inactive: {
        message: "District is already inactive with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    confirmation_required: {
        message: "Confirmation required to delete district",
        status: statusCodes.BadRequest,
    },
    already_deleted: {
        message: "District is already deleted with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    not_deleted: {
        message: "District is not deleted with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    no_change_detected: {
        message: "No change detected in district with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    country_not_found: {
        message: "Country not found with id: {0}",
        status: statusCodes.NotFound,
    },
    region_not_found: {
        message: "Region not found with id: {0}",
        status: statusCodes.NotFound,
    },
};

export const districtSuccessMessages = {
    district_created: {
        message: "District created successfully.",
        status: statusCodes.Created,
    },
    district_activate: {
        message: "District activated successfully.",
        status: statusCodes.OK,
    },
    district_deactivate: {
        message: "District deactivated successfully.",
        status: statusCodes.OK,
    },
    district_deleted: {
        message: "District deleted successfully.",
        status: statusCodes.OK,
    },
    district_listed: {
        message: "Districts listed successfully.",
        status: statusCodes.OK,
    },
    district_fetched: {
        message: "District details fetched successfully.",
        status: statusCodes.OK,
    },
    district_updated: {
        message: "District updated successfully.",
        status: statusCodes.OK,
    },
};
