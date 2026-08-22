import { statusCodes } from "@/utils/definitions/constants/common";

export const serviceDocumentErrorsMessages = {
    created_by_format: {
        message: "created by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    updated_by_format: {
        message: "updated by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    invalid_id: {
        message: "Invalid service document id: {0}",
        status: statusCodes.BadRequest,
    },
    service_document_not_found: {
        message: "Service document not found with id: {0}",
        status: statusCodes.NotFound,
    },
    already_exists: {
        message: "Service document already exists with name/item_code: {0}",
        status: statusCodes.Conflict,
    },
    invalid_request: {
        message: "Invalid request",
        status: statusCodes.BadRequest,
    },
    already_activated: {
        message: "Service document is already activated with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    already_inactive: {
        message: "Service document is already inactive with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    confirmation_required: {
        message: "Confirmation required to delete service document",
        status: statusCodes.BadRequest,
    },
    already_deleted: {
        message: "Service document is already deleted with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    not_deleted: {
        message: "Service document is not deleted with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    no_change_detected: {
        message: "No change detected in service document with name: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    document_not_found: {
        message: "Sample document not found with id: {0}",
        status: statusCodes.NotFound,
    },
    status_not_found: {
        message: "Status not found with id: {0}",
        status: statusCodes.NotFound,
    },
    document_types_not_found: {
        message: "Document types not found with id: {0}",
        status: statusCodes.NotFound,
    },
};

export const serviceDocumentSuccessMessages = {
    service_document_created: {
        message: "Service document created successfully.",
        status: statusCodes.Created,
    },
    service_document_activate: {
        message: "Service document activated successfully.",
        status: statusCodes.OK,
    },
    service_document_deactivate: {
        message: "Service document deactivated successfully.",
        status: statusCodes.OK,
    },
    service_document_deleted: {
        message: "Service document deleted successfully.",
        status: statusCodes.OK,
    },
    service_document_listed: {
        message: "Service documents listed successfully.",
        status: statusCodes.OK,
    },
    service_document_fetched: {
        message: "Service document details fetched successfully.",
        status: statusCodes.OK,
    },
    service_document_updated: {
        message: "Service document updated successfully.",
        status: statusCodes.OK,
    },
};
