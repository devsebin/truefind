import { statusCodes } from "@/utils/definitions/constants/common";

export const bundleCountryConfigErrorsMessages = {
  something_went_wrong: {
    message: "Something went wrong",
    status: statusCodes.InternalServerError,
  },
  country_config_already_exists: {
    message:
      "Country configuration already exists for this bundle and country.",
    status: statusCodes.Conflict,
  },
  bundle_not_found: {
    message: "Bundle not found.",
    status: statusCodes.NotFound,
  },
  country_not_found: {
    message: "Country not found.",
    status: statusCodes.NotFound,
  },
  currency_not_found: {
    message: "Currency not found.",
    status: statusCodes.NotFound,
  },
  units_not_found: {
    message: "Unit not found.",
    status: statusCodes.NotFound,
  },
};

export const bundleCountryConfigSuccessMessages = {
  country_config_created: {
    message: "Bundle country configuration created successfully.",
    status: statusCodes.Created,
  },
  country_config_updated: {
    message: "Bundle country configuration updated successfully.",
    status: statusCodes.OK,
  },
  country_config_deleted: {
    message: "Bundle country configuration deleted successfully.",
    status: statusCodes.OK,
  },
  country_config_fetched: {
    message: "Bundle country configuration fetched successfully.",
    status: statusCodes.OK,
  },
};
