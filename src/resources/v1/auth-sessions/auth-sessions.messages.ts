import { statusCodes } from "@/utils/definitions/constants/common";

export const authSessionsErrorsMessages = {
  session_not_found: {
    message: "Session not found for the given id.",
    status: statusCodes.NotFound,
  },
  already_exists: {
    message: "Session already exists.",
    status: statusCodes.Conflict,
  },
  user_not_found: {
    message: "User not found.",
    status: statusCodes.NotFound,
  },
  auth_session_not_created: {
    message: "Error while creating auth session.",
    status: statusCodes.InternalServerError,
  },
};

export const authSessionsSuccessMessages = {
  session_created: {
    message: "Session created successfully.",
    status: statusCodes.Created,
  },
  authentication_sessions_listed: {
    message: "Authentication sessions listed successfully.",
    status: statusCodes.OK,
  },
};
