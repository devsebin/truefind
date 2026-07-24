import { statusCodes } from "@/utils/definitions/constants/common";

export const usersErrorsMessages = {
  user_not_found: {
    message: "User not found.",
    status: statusCodes.NotFound,
  },
  already_exists: {
    message: "User already exists.",
    status: statusCodes.Conflict,
  },
};

export const usersSuccessMessages = {
};
