import { statusCodes } from "@/utils/definitions/constants/common";

export const unitsErrorsMessages = {
    created_by_format: {
        message: "created by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    updated_by_format: {
        message: "updated by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    invalid_id: {
        message: "Invalid unit id: {0}",
        status: statusCodes.BadRequest,
    },
    units_not_found: {
        message: "Unit not found with id: {0}",
        status: statusCodes.NotFound,
    },
    already_exists: {
        message: "Unit already exists with title/label: {0}",
        status: statusCodes.Conflict,
    },
    invalid_request: {
        message: "Invalid request",
        status: statusCodes.BadRequest,
    },
    already_activated: {
        message: "Unit is already activated with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    already_inactive: {
        message: "Unit is already inactive with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    confirmation_required: {
        message: "Confirmation required to delete unit",
        status: statusCodes.BadRequest,
    },
    already_deleted: {
        message: "Unit is already deleted with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    not_deleted: {
        message: "Unit is not deleted with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    no_change_detected: {
        message: "No change detected in unit with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    cannot_disable_default: {
        message: "Cannot disable default unit",
        status: statusCodes.Conflict,
    },
    cannot_delete_default: {
        message: "Cannot delete default unit",
        status: statusCodes.Conflict,
    },
};

export const unitsSuccessMessages = {
    units_created: {
        message: "Unit created successfully.",
        status: statusCodes.Created,
    },
    units_activate: {
        message: "Unit activated successfully.",
        status: statusCodes.OK,
    },
    units_deactivate: {
        message: "Unit deactivated successfully.",
        status: statusCodes.OK,
    },
    units_deleted: {
        message: "Unit deleted successfully.",
        status: statusCodes.OK,
    },
    units_listed: {
        message: "Units listed successfully.",
        status: statusCodes.OK,
    },
    units_fetched: {
        message: "Unit details fetched successfully.",
        status: statusCodes.OK,
    },
    units_updated: {
        message: "Unit updated successfully.",
        status: statusCodes.OK,
    },
};
