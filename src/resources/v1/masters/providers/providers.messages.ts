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
    duplicate_country_code: {
        message: "Duplicate country code: {0}",
        status: statusCodes.BadRequest,
    },
    invalid_country_id: {
        message: "Invalid country id: {0}",
        status: statusCodes.BadRequest,
    },
    country_must_have_at_least_one_type: {
        message: "Country must have at least one type",
        status: statusCodes.BadRequest,
    },
    duplicate_provider_type: {
        message: "Duplicate provider type: {0}",
        status: statusCodes.BadRequest,
    },
    only_one_default_allowed_per_country: {
        message: "Only one default type allowed per country: {0}",
        status: statusCodes.BadRequest,
    },
    invalid_country_id_format: {
        message: "Invalid country id format: {0}",
        status: statusCodes.BadRequest,
    },
    country_not_found: {
        message: "Country not found with id: {0}",
        status: statusCodes.NotFound,
    },
    country_code_mismatch: {
        message: "Country code mismatch: {0}",
        status: statusCodes.BadRequest,
    },
    cannot_remove_linked_countries: {
        message: "Cannot remove linked countries: {0}",
        status: statusCodes.BadRequest,
    },
    unsupported_message_type: {
        message: "Unsupported message type: {0}",
        status: statusCodes.BadRequest,
    },
    handler_not_found: {
        message: "Handler not found",
        status: statusCodes.NotFound,
    },
    provider_inactive: {
        message: "Provider is inactive with id: {0}",
        status: statusCodes.BadRequest,
    },
    country_inactive: {
        message: "Country is inactive with id: {0}",
        status: statusCodes.BadRequest,
    },
    country_already_linked: {
        message: "Country with id {0} is already linked to this provider",
        status: statusCodes.Conflict,
    },
    country_not_linked: {
        message: "Country with id {0} is not linked to this provider",
        status: statusCodes.BadRequest,
    },
    type_not_found: {
        message: "Provider type with id {0} is not found",
        status: statusCodes.NotFound,
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
    country_linked: {
        message: "Country linked to provider successfully.",
        status: statusCodes.OK,
    },
    country_link_updated: {
        message: "Country link details updated successfully.",
        status: statusCodes.OK,
    },
    type_test_completed: {
        message: "Provider type test completed.",
        status: statusCodes.OK,
    },
};