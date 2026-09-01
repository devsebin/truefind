import { ApiResponse } from "@/utils/responses/api.response";
import { CustomError } from "@/utils/responses/error.response";
import { ErrorTypes } from "@/utils/helpers/response-builder";
import { statusCodes } from "@/utils/definitions/constants/common";

const errorTypeToStatusCode: Record<ErrorTypes, number> = {
  [ErrorTypes.BAD_REQUEST]: statusCodes.BadRequest,
  [ErrorTypes.NOT_FOUND]: statusCodes.NotFound,
  [ErrorTypes.CONFLICT]: statusCodes.Conflict,
  [ErrorTypes.UNAUTHORIZED]: statusCodes.Unauthorized,
  [ErrorTypes.TOO_MANY_REQUESTS]: statusCodes.TooManyRequests,
  [ErrorTypes.INTERNAL_SERVER_ERROR]: statusCodes.InternalServerError,
  [ErrorTypes.VALIDATION_ERROR]: statusCodes.BadRequest,
};

export function throwEnablementError<T = any>(
  message: string,
  data?: ApiResponse<T>
): never {
  const error = new Error(message) as CustomError & { status?: number };
  error.message = message;
  error.name = "ValidationError";
  error.data = data;
  if (data?.error?.code && errorTypeToStatusCode[data.error.code as ErrorTypes]) {
    error.statusCode = errorTypeToStatusCode[data.error.code as ErrorTypes];
    error.status = error.statusCode;
  } else {
    error.statusCode = statusCodes.BadRequest;
    error.status = statusCodes.BadRequest;
  }
  throw error;
}
