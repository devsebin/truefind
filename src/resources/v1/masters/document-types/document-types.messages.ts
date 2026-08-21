import { statusCodes } from "@/utils/definitions/constants/common";

export const documentTypesErrorsMessages = {
    created_by_format: {
        message: "created by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    updated_by_format: {
        message: "updated by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    invalid_id: {
        message: "Invalid document type id: {0}",
        status: statusCodes.BadRequest,
    },
    document_types_not_found: {
        message: "Document type not found with id: {0}",
        status: statusCodes.NotFound,
    },
    already_exists: {
        message: "Document type already exists with title/label: {0}",
        status: statusCodes.Conflict,
    },
    invalid_request: {
        message: "Invalid request",
        status: statusCodes.BadRequest,
    },
    already_activated: {
        message: "Document type is already activated with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    already_inactive: {
        message: "Document type is already inactive with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    confirmation_required: {
        message: "Confirmation required to delete document type",
        status: statusCodes.BadRequest,
    },
    already_deleted: {
        message: "Document type is already deleted with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    not_deleted: {
        message: "Document type is not deleted with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    no_change_detected: {
        message: "No change detected in document type with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    cannot_disable_default: {
        message: "Cannot disable default document type",
        status: statusCodes.Conflict,
    },
    cannot_delete_default: {
        message: "Cannot delete default document type",
        status: statusCodes.Conflict,
    },
};

export const documentTypesSuccessMessages = {
    document_types_created: {
        message: "Document type created successfully.",
        status: statusCodes.Created,
    },
    document_types_activate: {
        message: "Document type activated successfully.",
        status: statusCodes.OK,
    },
    document_types_deactivate: {
        message: "Document type deactivated successfully.",
        status: statusCodes.OK,
    },
    document_types_deleted: {
        message: "Document type deleted successfully.",
        status: statusCodes.OK,
    },
    document_types_listed: {
        message: "Document types listed successfully.",
        status: statusCodes.OK,
    },
    document_types_fetched: {
        message: "Document type details fetched successfully.",
        status: statusCodes.OK,
    },
    document_types_updated: {
        message: "Document type updated successfully.",
        status: statusCodes.OK,
    },
};
