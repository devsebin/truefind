import { ApiResponse } from "@/utils/responses/api.response";
import {
  serviceAreaConfigErrorsMessages,
  serviceAreaConfigSuccessMessages,
} from "./service-area-configurations.messages";
import { CustomError } from "@/utils/responses/error.response";
import { successResponse } from "@/utils/responses/success.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";

export function returnAreaConfigSuccess(
  type: keyof typeof serviceAreaConfigSuccessMessages,
  data: any = [],
  DbTransaction: DbTransaction[] = [],
) {
  const { message, status } = serviceAreaConfigSuccessMessages[type];
  return {
    result: successResponse(message, status, data),
    DbTransaction: DbTransaction,
  };
}

export function throwAreaConfigError<T = any>(
  message: keyof typeof serviceAreaConfigErrorsMessages,
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
    select: "title",
  },
  {
    path: "service_id",
  },
  {
    path: "suburb_id",
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
