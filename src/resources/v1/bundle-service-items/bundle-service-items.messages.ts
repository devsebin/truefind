import { statusCodes } from "@/utils/definitions/constants/common";

export const bundleServiceItemErrorsMessages = {
  something_went_wrong: {
    message: "Something went wrong",
    status: statusCodes.InternalServerError,
  },
  bundle_service_item_already_exists: {
    message: "Service already exists in this bundle.",
    status: statusCodes.Conflict,
  },
  bundle_service_item_not_found: {
    message: "Bundle service item not found.",
    status: statusCodes.NotFound,
  },
  bundle_not_found: {
    message: "Bundle not found.",
    status: statusCodes.NotFound,
  },
  service_not_found: {
    message: "Service not found.",
    status: statusCodes.NotFound,
  },
};

export const bundleServiceItemSuccessMessages = {
  bundle_service_item_created: {
    message: "Bundle service item created successfully.",
    status: statusCodes.Created,
  },
  bundle_service_item_updated: {
    message: "Bundle service item updated successfully.",
    status: statusCodes.OK,
  },
  bundle_service_item_deleted: {
    message: "Bundle service item deleted successfully.",
    status: statusCodes.OK,
  },
  bundle_service_item_fetched: {
    message: "Bundle service item fetched successfully.",
    status: statusCodes.OK,
  },
  bundle_service_item_status_updated: {
    message: "Bundle service item status updated successfully.",
    status: statusCodes.OK,
  },
};
