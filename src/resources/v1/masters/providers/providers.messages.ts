import { statusCodes } from "@/utils/definitions/constants/common";

export const providerErrorsMessages = {
    created_by_format: {
        message: "created by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    updated_by_format: {
        message: "updated by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    invalid_id: {
        message: "Invalid provider id: {0}",
        status: statusCodes.BadRequest,
    },
    provider_not_found: {
        message: "Provider not found with id: {0}",
        status: statusCodes.NotFound,
    },
    already_exists: {
        message: "Provider already exists with name: {0}",
        status: statusCodes.Conflict,
    },
    invalid_request: {
        message: "Invalid request",
        status: statusCodes.BadRequest,
    },
    already_activated: {
        message: "Provider is already activated with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    already_inactive: {
        message: "Provider is already inactive with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    confirmation_required: {
        message: "Confirmation required to delete provider",
        status: statusCodes.BadRequest,
    },
    already_deleted: {
        message: "Provider is already deleted with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    not_deleted: {
        message: "Provider is not deleted with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    no_change_detected: {
        message: "No change detected in provider with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
};

export const providerSuccessMessages = {
    provider_created: {
        message: "Provider created successfully.",
        status: statusCodes.Created,
    },
    provider_activate: {
        message: "Provider activated successfully.",
        status: statusCodes.OK,
    },
    provider_deactivate: {
        message: "Provider deactivated successfully.",
        status: statusCodes.OK,
    },
    provider_deleted: {
        message: "Provider deleted successfully.",
        status: statusCodes.OK,
    },
    provider_listed: {
        message: "Providers listed successfully.",
        status: statusCodes.OK,
    },
    provider_fetched: {
        message: "Provider details fetched successfully.",
        status: statusCodes.OK,
    },
    provider_updated: {
        message: "Provider updated successfully.",
        status: statusCodes.OK,
    },
};