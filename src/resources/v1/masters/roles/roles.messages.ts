import { statusCodes } from "@/utils/definitions/constants/common";

export const rolesErrorsMessages = {
    created_by_format: {
        message: "created by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    updated_by_format: {
        message: "updated by format is invalid {0}",
        status: statusCodes.BadRequest,
    },
    invalid_id: {
        message: "Invalid role id: {0}",
        status: statusCodes.BadRequest,
    },
    roles_not_found: {
        message: "Role not found with id: {0}",
        status: statusCodes.NotFound,
    },
    already_exists: {
        message: "Role already exists with title/label: {0}",
        status: statusCodes.Conflict,
    },
    invalid_request: {
        message: "Invalid request",
        status: statusCodes.BadRequest,
    },
    already_activated: {
        message: "Role is already activated with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    already_inactive: {
        message: "Role is already inactive with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    confirmation_required: {
        message: "Confirmation required to delete role",
        status: statusCodes.BadRequest,
    },
    already_deleted: {
        message: "Role is already deleted with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    not_deleted: {
        message: "Role is not deleted with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    no_change_detected: {
        message: "No change detected in role with title: {0} and id: {1}",
        status: statusCodes.BadRequest,
    },
    cannot_disable_default: {
        message: "Cannot disable default role",
        status: statusCodes.Conflict,
    },
    cannot_delete_default: {
        message: "Cannot delete default role",
        status: statusCodes.Conflict,
    },
};

export const rolesSuccessMessages = {
    roles_created: {
        message: "Role created successfully.",
        status: statusCodes.Created,
    },
    roles_activate: {
        message: "Role activated successfully.",
        status: statusCodes.OK,
    },
    roles_deactivate: {
        message: "Role deactivated successfully.",
        status: statusCodes.OK,
    },
    roles_deleted: {
        message: "Role deleted successfully.",
        status: statusCodes.OK,
    },
    roles_listed: {
        message: "Roles listed successfully.",
        status: statusCodes.OK,
    },
    roles_fetched: {
        message: "Role details fetched successfully.",
        status: statusCodes.OK,
    },
    roles_updated: {
        message: "Role updated successfully.",
        status: statusCodes.OK,
    },
};
