import { ApiResponse } from "@/utils/responses/api.response";
import {
  bundleCountryConfigErrorsMessages,
  bundleCountryConfigSuccessMessages,
} from "./bundle-country-configurations.messages";
import { CustomError } from "@/utils/responses/error.response";
import { successResponse } from "@/utils/responses/success.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";

export function returnBundleCountryConfigSuccess(
  type: keyof typeof bundleCountryConfigSuccessMessages,
  data: any = [],
  DbTransaction: DbTransaction[] = [],
) {
  const { message, status } = bundleCountryConfigSuccessMessages[type];
  return {
    result: successResponse(message, status, data),
    DbTransaction: DbTransaction,
  };
}

export function throwBundleCountryConfigError<T = any>(
  message: keyof typeof bundleCountryConfigErrorsMessages,
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
    path: "country_id",
    populate: {
      path: "providers.provider_id",
    },
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
