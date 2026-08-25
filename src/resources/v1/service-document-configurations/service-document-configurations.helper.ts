import { ApiResponse } from "@/utils/responses/api.response";
import {
  serviceDocumentConfigErrorsMessages,
  serviceDocumentConfigSuccessMessages,
} from "./service-document-configurations.messages";
import { CustomError } from "@/utils/responses/error.response";
import { successResponse } from "@/utils/responses/success.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";

export function returnServiceDocumentConfigSuccess(
  type: keyof typeof serviceDocumentConfigSuccessMessages,
  data: any = [],
  DbTransaction: DbTransaction[] = [],
) {
  const { message, status } = serviceDocumentConfigSuccessMessages[type];
  return {
    result: successResponse(message, status, data),
    DbTransaction: DbTransaction,
  };
}

export function throwServiceDocumentConfigError<T = any>(
  message: keyof typeof serviceDocumentConfigErrorsMessages,
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
  {
    path: "required_documents.document_id",
    select: "name display_name item_code max_file_size accepted_mimeTypes description samples data_requirements",
    populate: {
      path: "samples",
      select: "name document_type content_type keys unsigned_urls",
    },
  },
  {
    path: "required_documents.exemption_documents.document_id",
    select: "name display_name item_code max_file_size accepted_mimeTypes description samples data_requirements",
    populate: {
      path: "samples",
      select: "name document_type content_type keys unsigned_urls",
    },
  },
  {
    path: "required_documents.status_id",
    select: "title label color",
  },
];

export function buildPopulateQuery(reqQuery: any) {
  return {
    ...reqQuery,
    populate: populateFields,
  };
}
