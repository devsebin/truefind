import { statusCodes } from "@/utils/definitions/constants/common";

export const serviceInformationErrorsMessages = {
  something_went_wrong: {
    message: "Something went wrong",
    status: statusCodes.InternalServerError,
  },
  invalid_id: {
    message: "Invalid ID provided.",
    status: statusCodes.BadRequest,
  },
  service_not_found: {
    message: "Service not found.",
    status: statusCodes.NotFound,
  },
  invalid_service_type: {
    message: "Service must be of type service.",
    status: statusCodes.BadRequest,
  },
  information_not_found: {
    message: "Service information not found.",
    status: statusCodes.NotFound,
  },
  information_already_exists: {
    message: "Service information already exists for this service.",
    status: statusCodes.Conflict,
  },
  already_enabled: {
    message: "Service information is already enabled.",
    status: statusCodes.Conflict,
  },
  already_disabled: {
    message: "Service information is already disabled.",
    status: statusCodes.Conflict,
  },
  no_change_detected: {
    message: "No changes detected.",
    status: statusCodes.Conflict,
  },
  duplicate_how_it_works_sort_order: {
    message: "Duplicate sort_order found in how_it_works items.",
    status: statusCodes.BadRequest,
  },
  duplicate_how_it_works_step: {
    message: "Duplicate step found in how_it_works items.",
    status: statusCodes.BadRequest,
  },
  duplicate_included_items_sort_order: {
    message: "Duplicate sort_order found in included_items.",
    status: statusCodes.BadRequest,
  },
  duplicate_faqs_sort_order: {
    message: "Duplicate sort_order found in faqs.",
    status: statusCodes.BadRequest,
  },
  duplicate_disclaimers_sort_order: {
    message: "Duplicate sort_order found in disclaimers.",
    status: statusCodes.BadRequest,
  },
  status_not_found: {
    message: "Required status not found.",
    status: statusCodes.NotFound,
  },
};

export const serviceInformationSuccessMessages = {
  information_created: {
    message: "Service information created successfully.",
    status: statusCodes.Created,
  },
  information_fetched: {
    message: "Service information fetched successfully.",
    status: statusCodes.OK,
  },
  information_list_fetched: {
    message: "Service informations fetched successfully.",
    status: statusCodes.OK,
  },
  information_updated: {
    message: "Service information updated successfully.",
    status: statusCodes.OK,
  },
  information_deleted: {
    message: "Service information deleted successfully.",
    status: statusCodes.OK,
  },
  information_enabled: {
    message: "Service information enabled successfully.",
    status: statusCodes.OK,
  },
  information_disabled: {
    message: "Service information disabled successfully.",
    status: statusCodes.OK,
  },
};
