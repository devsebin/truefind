import { statusCodes } from "@/utils/definitions/constants/common";

export const servicesErrorsMessages = {
  something_went_wrong: {
    message: "Something went wrong",
    status: statusCodes.InternalServerError,
  },
  category_name_already_exist: {
    message: "Category already exist with name {0}.",
    status: statusCodes.BadRequest,
  },
  icon_not_found: {
    message: "Icon not found with id {0}.",
    status: statusCodes.BadRequest,
  },
  subcategory_name_already_exist: {
    message: "Subcategory already exist with name {0}.",
    status: statusCodes.BadRequest,
  },
  parent_category_not_found: {
    message: "Parent category not found with id {0}.",
    status: statusCodes.BadRequest,
  },
  parent_must_not_be_task: {
    message: "Parent category must not be task.",
    status: statusCodes.BadRequest,
  },
  category_not_found: {
    message: "Category not found with id {0}.",
    status: statusCodes.BadRequest,
  },
  icon_must_be_an_image: {
    message: "Icon must be an image PNG.",
    status: statusCodes.BadRequest,
  },
  task_name_already_exist: {
    message: "Task name already exist with name {0}.",
    status: statusCodes.BadRequest,
  },
  no_root_categories_found: {
    message: "No root categories found.",
    status: statusCodes.BadRequest,
  },
  parent_category_must_be_disabled: {
    message: "Parent category must be disabled.",
    status: statusCodes.BadRequest,
  },
  service_must_be_disabled: {
    message: "Service must be disabled.",
    status: statusCodes.BadRequest,
  },
  service_already_enabled: {
    message: "Service already enabled.",
    status: statusCodes.BadRequest,
  },
  service_already_disabled: {
    message: "Service already disabled.",
    status: statusCodes.BadRequest,
  },

};

export const serviceSuccessMessages = {
  service_created: {
    message: "Service created successfully.",
    status: statusCodes.Created,
  },
  service_updated: {
    message: "Service updated successfully.",
    status: statusCodes.OK,
  },
  service_deleted: {
    message: "Service deleted successfully.",
    status: statusCodes.OK,
  },
  service_fetched: {
    message: "Service fetched successfully.",
    status: statusCodes.OK,
  },
  category_fetched: {
    message: "Category fetched successfully.",
    status: statusCodes.OK,
  },
  category_updated: {
    message: "Category updated successfully.",
    status: statusCodes.OK,
  },
  category_deleted: {
    message: "Category deleted successfully.",
    status: statusCodes.OK,
  },
  category_created: {
    message: "Category created successfully.",
    status: statusCodes.Created,
  },
  sub_category_created: {
    message: "Sub category created successfully.",
    status: statusCodes.Created,
  },
};
