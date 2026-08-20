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
  suburb_not_found: {
    message: "Your location is not within any supported suburb.",
    status: statusCodes.BadRequest,
  },
};

export const usersSuccessMessages = {
  basic_details_updated: {
    message: "User basic details stored successfully.",
    status: statusCodes.OK,
  },
  services_fetched: {
    message: "User services fetched successfully.",
    status: statusCodes.OK,
  },
  location_fetched: {
    message: "User location fetched successfully.",
    status: statusCodes.OK,
  },
};
