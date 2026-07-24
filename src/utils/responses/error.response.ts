import mongoose from "mongoose";
import { errorMessages, statusCodes } from "../definitions/constants/common";

export const objectIdValidator = (value: string, helpers: any) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message(
      `"${helpers.state.path.join(".")}" must be a valid MongoDB ObjectId`,
    );
  }
  return value;
};
export interface CustomError extends Error {
  statusCode?: number;
  data?: any;
}

export interface ErrorData {
  success: boolean;
  message: string;
  code: number;
  data?: any;
}

export interface ErrorResponse {
  result: ErrorData;
  DbTransaction: [];
}

export const errorResponse = (
  message: string,
  statusCode: number,
  data?: any,
) => ({
  success: false,
  message,
  code: statusCode,
  data: data,
});
export function rethrowIfKnown(
  err: any,
  contextMessage: string,
  errorMap: Record<string, { message: string; status: number }>,
): never {
  if (err instanceof Error && err.message in errorMap) {
    throw err;
  }
  throw new Error(`${contextMessage}: ${(err as Error).message}`);
}

export function buildErrorResult(
  message: string,
  errorMap?: Record<string, { message: string; status: number }>,
  data: any = undefined,
  defaultType: string = errorMessages.SomethingWentWrong,
  defaultStatus: number = statusCodes.InternalServerError,
) {
  if (Array.isArray(data)) {
    data = data;
  } else if (data) {
    data = [data];
  } else {
    data = [];
  }
  // ✅ If message exists in map → use mapped values
  if (errorMap && errorMap[message]) {
    const mapped = errorMap[message];

    return {
      result: errorResponse(mapped.message, mapped.status, data),
      DbTransaction: [],
    };
  }

  // 🔁 fallback
  return {
    result: errorResponse(defaultType, defaultStatus, [message]),
    DbTransaction: [],
  };
}
