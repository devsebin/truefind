import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  declaimerErrorsMessages,
  declaimerSuccessMessages,
} from "./declaimers.messages";
import { successResponse } from "@/utils/responses/success.response";
import { CustomError } from "@/utils/responses/error.response";
import { ApiResponse } from "@/utils/responses/api.response";

export function declaimerPayload(
  type: keyof typeof declaimerSuccessMessages,
  data: any = [],
  DbTransaction: DbTransaction[] = [],
) {
  const { message, status } = declaimerSuccessMessages[type];
  return {
    result: successResponse(message, status, data),
    DbTransaction: DbTransaction,
  };
}

export function throwError<T = any>(
  message: keyof typeof declaimerErrorsMessages,
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
    path: "country",
    select: "name iso_code iso_code_3",
  },
];

export function buildPopulateQuery(reqQuery: any) {
  return {
    ...reqQuery,
    populate: populateFields,
  };
}
