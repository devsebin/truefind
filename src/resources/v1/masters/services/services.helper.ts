import { ApiResponse } from "@/utils/responses/api.response";
import {
  servicesErrorsMessages,
  serviceSuccessMessages,
} from "./services.messages";
import { CustomError } from "@/utils/responses/error.response";
import { successResponse } from "@/utils/responses/success.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";

export function returnServiceSuccess(
  type: keyof typeof serviceSuccessMessages,
  data: any = [],
  DbTransaction: DbTransaction[] = [],
) {
  const { message, status } = serviceSuccessMessages[type];
  return {
    result: successResponse(message, status, data),
    DbTransaction: DbTransaction,
  };
}

export function throwError<T = any>(
  message: keyof typeof servicesErrorsMessages,
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
    select: "_id title label color is_default is_active is_deleted",
  },
  {
    path: "icon",
    select:
      "_id name document_type content_type unsigned_urls is_active is_deleted",
  },
  {
    path: "children",
    populate: [
      {
        path: "icon",
        select:
          "_id name document_type content_type unsigned_urls is_active is_deleted",
      },
      {
        path: "status_id",
        select: "_id title label color is_default is_active is_deleted",
      },
      {
        path: "children",
        populate: [
          {
            path: "icon",
            select:
              "_id name document_type content_type unsigned_urls is_active is_deleted",
          },
          {
            path: "status_id",
            select: "_id title label color is_default is_active is_deleted",
          },
        ],
      },
    ],
  },
];

export function buildPopulateQuery(reqQuery: any) {
  return {
    ...reqQuery,
    populate: populateFields,
  };
}
