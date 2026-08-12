import { statusCodes } from "@/utils/definitions/constants/common";

export const prioritiesErrorsMessages = {
    created_by_format: {
        message: "created by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    updated_by_format: {
        message: "updated by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    invalid_id: {
        message: "Invalid priority id: {0}",
        status: statusCodes.BadRequest,
    },
    priorities_not_found: {
        message: "Priority not found with id: {0}",
        status: statusCodes.NotFound,
    },
    already_exists: {
        message: "Priority already exists with title/label: {0}",
        status: statusCodes.Conflict,
    },
    invalid_request: {
        message: "Invalid request",
        status: statusCodes.BadRequest,
    },
    already_activated: {
        message: "Priority is already activated with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    already_inactive: {
        message: "Priority is already inactive with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    confirmation_required: {
        message: "Confirmation required to delete priority",
        status: statusCodes.BadRequest,
    },
    already_deleted: {
        message: "Priority is already deleted with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    not_deleted: {
        message: "Priority is not deleted with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    no_change_detected: {
        message: "No change detected in priority with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    cannot_disable_default: {
        message: "Cannot disable default priority",
        status: statusCodes.Conflict,
    },
    cannot_delete_default: {
        message: "Cannot delete default priority",
        status: statusCodes.Conflict,
    },
};

export const prioritiesSuccessMessages = {
    priorities_created: {
        message: "Priority created successfully.",
        status: statusCodes.Created,
    },
    priorities_activate: {
        message: "Priority activated successfully.",
        status: statusCodes.OK,
    },
    priorities_deactivate: {
        message: "Priority deactivated successfully.",
        status: statusCodes.OK,
    },
    priorities_deleted: {
        message: "Priority deleted successfully.",
        status: statusCodes.OK,
    },
    priorities_listed: {
        message: "Priorities listed successfully.",
        status: statusCodes.OK,
    },
    priorities_fetched: {
        message: "Priority details fetched successfully.",
        status: statusCodes.OK,
    },
    priorities_updated: {
        message: "Priority updated successfully.",
        status: statusCodes.OK,
    },
};
