import { statusCodes } from "@/utils/definitions/constants/common";

export const suburbErrorsMessages = {
    created_by_format: {
        message: "created by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    updated_by_format: {
        message: "updated by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    invalid_id: {
        message: "Invalid suburb id: {0}",
        status: statusCodes.BadRequest,
    },
    suburb_not_found: {
        message: "Suburb not found with id: {0}",
        status: statusCodes.NotFound,
    },
    already_exists: {
        message: "Suburb already exists with name/code: {0}",
        status: statusCodes.Conflict,
    },
    invalid_request: {
        message: "Invalid request",
        status: statusCodes.BadRequest,
    },
    already_activated: {
        message: "Suburb is already activated with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    already_inactive: {
        message: "Suburb is already inactive with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    confirmation_required: {
        message: "Confirmation required to delete suburb",
        status: statusCodes.BadRequest,
    },
    already_deleted: {
        message: "Suburb is already deleted with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    not_deleted: {
        message: "Suburb is not deleted with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    no_change_detected: {
        message: "No change detected in suburb with name: {0} and id: {1}",
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
    district_not_found: {
        message: "District not found with id: {0}",
        status: statusCodes.NotFound,
    },
    region_not_belonging: {
        message: "Region does not belong to the selected country",
        status: statusCodes.BadRequest,
    },
    district_not_belonging: {
        message: "District does not belong to the selected region",
        status: statusCodes.BadRequest,
    },
    invalid_coordinates: {
        message: "Latitude and longitude must be valid numbers",
        status: statusCodes.BadRequest,
    },
};

export const suburbSuccessMessages = {
    suburb_created: {
        message: "Suburb created successfully.",
        status: statusCodes.Created,
    },
    suburb_activate: {
        message: "Suburb activated successfully.",
        status: statusCodes.OK,
    },
    suburb_deactivate: {
        message: "Suburb deactivated successfully.",
        status: statusCodes.OK,
    },
    suburb_deleted: {
        message: "Suburb deleted successfully.",
        status: statusCodes.OK,
    },
    suburb_listed: {
        message: "Suburbs listed successfully.",
        status: statusCodes.OK,
    },
    suburb_fetched: {
        message: "Suburb details fetched successfully.",
        status: statusCodes.OK,
    },
    suburb_updated: {
        message: "Suburb updated successfully.",
        status: statusCodes.OK,
    },
};
