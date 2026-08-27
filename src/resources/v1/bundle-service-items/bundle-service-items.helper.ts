import { ApiResponse } from "@/utils/responses/api.response";
import {
  bundleServiceItemErrorsMessages,
  bundleServiceItemSuccessMessages,
} from "./bundle-service-items.messages";
import { CustomError } from "@/utils/responses/error.response";
import { successResponse } from "@/utils/responses/success.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";

export function returnBundleServiceItemSuccess(
  type: keyof typeof bundleServiceItemSuccessMessages,
  data: any = [],
  DbTransaction: DbTransaction[] = [],
) {
  const { message, status } = bundleServiceItemSuccessMessages[type];
  return {
    result: successResponse(message, status, data),
    DbTransaction: DbTransaction,
  };
}

export function throwBundleServiceItemError<T = any>(
  message: keyof typeof bundleServiceItemErrorsMessages,
  data: ApiResponse<T>,
): never {
  const error = new Error() as CustomError;
  error.message = message;
  error.name = "ValidationError";
  error.data = data;
  throw error;
}

export const populateFields = [
  {
    path: "created_by",
    select: "first_name last_name email",
  },
  {
    path: "updated_by",
    select: "first_name last_name email",
  },
  {
    path: "deleted_by",
    select: "first_name last_name email",
  },
  {
    path: "bundle_id",
    select: "name display_name code description status_id is_active",
    populate: {
      path: "status_id",
      select: "title label color is_default",
    },
  },
  {
    path: "service_id",
    select: "name code description is_active is_deleted",
  },
];

export function buildPopulateQuery(reqQuery: any) {
  return {
    ...reqQuery,
    populate: populateFields,
  };
}
