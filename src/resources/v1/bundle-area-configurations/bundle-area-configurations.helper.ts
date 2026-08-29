import { ApiResponse } from "@/utils/responses/api.response";
import {
  bundleAreaConfigErrorsMessages,
  bundleAreaConfigSuccessMessages,
} from "./bundle-area-configurations.messages";
import { CustomError } from "@/utils/responses/error.response";
import { successResponse } from "@/utils/responses/success.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";

export function returnBundleAreaConfigSuccess(
  type: keyof typeof bundleAreaConfigSuccessMessages,
  data: any = [],
  DbTransaction: DbTransaction[] = [],
) {
  const { message, status } = bundleAreaConfigSuccessMessages[type];
  return {
    result: successResponse(message, status, data),
    DbTransaction: DbTransaction,
  };
}

export function throwBundleAreaConfigError<T = any>(
  message: keyof typeof bundleAreaConfigErrorsMessages,
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
    path: "status_id",
    select: "title label color is_default",
  },
  {
    path: "bundle_id",
  },
  {
    path: "suburb_id",
  },
  {
    path: "country_configuration_id",
  },
  {
    path: "currency_id",
  },
  {
    path: "unit_id",
  },
];

export function buildPopulateQuery(reqQuery: any) {
  return {
    ...reqQuery,
    populate: populateFields,
  };
}
