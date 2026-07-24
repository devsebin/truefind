import { commonErrorMessages } from "../definitions/messages/common/common.error";
import { ApiResponse } from "../responses/api.response";
import { CustomError } from "../responses/error.response";
import { ErrorTypes, ResponseBuilder } from "./response-builder";
import { Request } from "express";

export function getRequestBody<TPayload, TDto>(
  request: Request,
  payload: TPayload | undefined,
  mapper: (payload: TPayload) => TDto,
): TDto {
  const body = payload ?? (request.body as TPayload);

  if (!body) {
    const response = ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
      message: "Request body is required.",
    });

    throwError("invalid_request", response);
  }

  return mapper(body);
}

export function throwError<T = any>(
  message: keyof typeof commonErrorMessages,
  data: ApiResponse<T>,
): never {
  const error = new Error() as CustomError;
  error.message = message;
  error.name = "ValidationError";
  error.data = data;
  throw error;
}
