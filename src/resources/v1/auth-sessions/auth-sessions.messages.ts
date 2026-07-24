import { statusCodes } from "@/utils/definitions/constants/common";

export const authSessionsErrorsMessages = {
  session_not_found: {
    message: "Session not found for the given id {0}.",
    status: statusCodes.NotFound,
  },
  already_exists: {
    message: "Session already exists.",
    status: statusCodes.Conflict,
  },
};

export const authSessionsSuccessMessages = {
};
