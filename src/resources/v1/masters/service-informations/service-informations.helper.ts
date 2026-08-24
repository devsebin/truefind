import { ApiResponse } from "@/utils/responses/api.response";
import {
  serviceInformationErrorsMessages,
  serviceInformationSuccessMessages,
} from "./service-informations.messages";
import { CustomError } from "@/utils/responses/error.response";
import { successResponse } from "@/utils/responses/success.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";

export function returnServiceInformationSuccess(
  type: keyof typeof serviceInformationSuccessMessages,
  data: any = [],
  DbTransaction: DbTransaction[] = [],
) {
  const { message, status } = serviceInformationSuccessMessages[type];
  return {
    result: successResponse(message, status, data),
    DbTransaction: DbTransaction,
  };
}

export function throwServiceInformationError<T = any>(
  message: keyof typeof serviceInformationErrorsMessages,
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
    select: "first_name last_name email role",
  },
  {
    path: "updated_by",
    select: "first_name last_name email role",
  },
  {
    path: "deleted_by",
    select: "first_name last_name email role",
  },
  {
    path: "status_id",
    select: "title label color",
  },
  {
    path: "service_id",
    select: "name code description type is_active",
  },
];

export function buildPopulateQuery(reqQuery: any) {
  return {
    ...reqQuery,
    populate: populateFields,
  };
}
