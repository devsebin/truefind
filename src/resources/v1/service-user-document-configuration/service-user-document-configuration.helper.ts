import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { CustomError } from "@/utils/responses/error.response";
import { successResponse } from "@/utils/responses/success.response";
import { ApiResponse } from "@/utils/responses/api.response";
import {
  serviceUserDocConfigErrorsMessages,
  serviceUserDocConfigSuccessMessages,
} from "./service-user-document-configuration.messages";

export function serviceUserDocConfigPayload(
  type: keyof typeof serviceUserDocConfigSuccessMessages,
  data: any = [],
  DbTransaction: DbTransaction[] = [],
) {
  const { message, status } = serviceUserDocConfigSuccessMessages[type];
  return {
    result: successResponse(message, status, data),
    DbTransaction: DbTransaction,
  };
}

export function throwError<T = any>(
  message: keyof typeof serviceUserDocConfigErrorsMessages,
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
    path: "user_id",
    select: "first_name last_name email role",
  },
  {
    path: "task_id",
    select: "name type description icon estimated_time estimated_time_unit",
    populate: {
      path: "icon",
      select: "name url",
    },
  },
  {
    path: "document_requirement_id",
    select:
      "name display_name item_code document_type_id max_file_size accepted_mimeTypes description samples data_requirements is_active",
    populate: [
      {
        path: "samples",
        select: "name document_type content_type keys unsigned_urls",
      },
    ],
  },
  {
    path: "verified_by",
    select: "first_name last_name email",
  },
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
];

export function buildPopulateQuery(reqQuery: any) {
  return {
    ...reqQuery,
    populate: populateFields,
  };
}
