import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { CustomError } from "@/utils/responses/error.response";
import { successResponse } from "@/utils/responses/success.response";
import { ApiResponse } from "@/utils/responses/api.response";
import {
  bundleLocationConfigStatusesErrorsMessages,
  bundleLocationConfigStatusesSuccessMessages,
} from "./bundle-location-config-statuses.messages";

export function bundleLocationConfigStatusesPayload(
  type: keyof typeof bundleLocationConfigStatusesSuccessMessages,
  data: any = [],
  DbTransaction: DbTransaction[] = [],
) {
  const { message, status } = bundleLocationConfigStatusesSuccessMessages[type];
  return {
    result: successResponse(message, status, data),
    DbTransaction: DbTransaction,
  };
}

export function throwError<T = any>(
  message: keyof typeof bundleLocationConfigStatusesErrorsMessages,
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
];

export function buildPopulateQuery(reqQuery: any) {
  return {
    ...reqQuery,
    populate: populateFields,
  };
}
