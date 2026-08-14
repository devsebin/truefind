import { statusCodes } from "@/utils/definitions/constants/common";

export const serviceAreaConfigErrorsMessages = {
  something_went_wrong: {
    message: "Something went wrong",
    status: statusCodes.InternalServerError,
  },
  category_not_found: {
    message: "Service not found with id {0}.",
    status: statusCodes.BadRequest,
  },
};

export const serviceAreaConfigSuccessMessages = {
  service_fetched: {
    message: "Service fetched successfully.",
    status: statusCodes.OK,
  },
  area_config_created: {
    message: "Area configuration overrides created successfully.",
    status: statusCodes.Created,
  },
  area_config_fetched: {
    message: "Area configuration overrides fetched successfully.",
    status: statusCodes.OK,
  },
};
