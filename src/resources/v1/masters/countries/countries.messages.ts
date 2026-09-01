import { statusCodes } from "@/utils/definitions/constants/common";

export const countryErrorsMessages = {
    created_by_format: {
        message: "created by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    updated_by_format: {
        message: "updated by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    invalid_id: {
        message: "Invalid country id: {0}",
        status: statusCodes.BadRequest,
    },
    country_not_found: {
        message: "Country not found with id: {0}",
        status: statusCodes.NotFound,
    },
    already_exists: {
        message: "Country already exists with name/code/iso: {0}",
        status: statusCodes.Conflict,
    },
    invalid_request: {
        message: "Invalid request",
        status: statusCodes.BadRequest,
    },
    already_activated: {
        message: "Country is already activated with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    already_inactive: {
        message: "Country is already inactive with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    confirmation_required: {
        message: "Confirmation required to delete country",
        status: statusCodes.BadRequest,
    },
    already_deleted: {
        message: "Country is already deleted with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    not_deleted: {
        message: "Country is not deleted with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    no_change_detected: {
        message: "No change detected in country with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    not_eligible_for_enablement: {
        message: "Country is not eligible for enablement under active policy",
        status: statusCodes.BadRequest,
    },
};

export const countrySuccessMessages = {
    country_created: {
        message: "Country created successfully.",
        status: statusCodes.Created,
    },
    country_activate: {
        message: "Country activated successfully.",
        status: statusCodes.OK,
    },
    country_deactivate: {
        message: "Country deactivated successfully.",
        status: statusCodes.OK,
    },
    country_deleted: {
        message: "Country deleted successfully.",
        status: statusCodes.OK,
    },
    country_listed: {
        message: "Countries listed successfully.",
        status: statusCodes.OK,
    },
    country_fetched: {
        message: "Country details fetched successfully.",
        status: statusCodes.OK,
    },
    country_updated: {
        message: "Country updated successfully.",
        status: statusCodes.OK,
    },
};
