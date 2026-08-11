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
  declaimer_not_found: {
    message: "Declaimer not found.",
    status: statusCodes.NotFound,
  },
  forbidden: {
    message: "You are not authorized to perform this action.",
    status: statusCodes.Forbidden,
  },
};

export const usersSuccessMessages = {
  basic_details_updated: {
    message: "User basic details stored successfully.",
    status: statusCodes.OK,
  },
};
