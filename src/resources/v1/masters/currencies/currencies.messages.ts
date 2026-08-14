import { statusCodes } from "@/utils/definitions/constants/common";

export const currenciesErrorsMessages = {
  something_went_wrong: {
    message: "Something went wrong",
    status: statusCodes.InternalServerError,
  },
  already_exists: {
    message: "Currency {0} already exists.",
    status: statusCodes.Conflict,
  },
  currency_not_found: {
    message: "Currency not found.",
    status: statusCodes.NotFound,
  },
  already_deleted: {
    message: "Currency is already deleted.",
    status: statusCodes.Conflict,
  },
  already_enabled: {
    message: "Currency is already enabled.",
    status: statusCodes.Conflict,
  },
  already_disabled: {
    message: "Currency is already disabled.",
    status: statusCodes.Conflict,
  },
  no_change_detected: {
    message: "No changes detected.",
    status: statusCodes.Conflict,
  },
};

export const currenciesSuccessMessages = {
  currency_created: {
    message: "Currency created successfully.",
    status: statusCodes.Created,
  },
  currency_updated: {
    message: "Currency updated successfully.",
    status: statusCodes.OK,
  },
  currency_deleted: {
    message: "Currency deleted successfully.",
    status: statusCodes.OK,
  },
  currency_fetched: {
    message: "Currency fetched successfully.",
    status: statusCodes.OK,
  },
  currency_enabled: {
    message: "Currency enabled successfully.",
    status: statusCodes.OK,
  },
  currency_disabled: {
    message: "Currency disabled successfully.",
    status: statusCodes.OK,
  },
};
