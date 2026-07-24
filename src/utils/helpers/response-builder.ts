import {
  ApiResponse,
  DependencyWarningAction,
  ErrorDetails,
} from "../responses/api.response";
import { generateToken } from "../../utils/helpers/otp-helper";

export enum ActionTypes {
  UNLINK_DEPENDENCIES = "UNLINK_DEPENDENCIES",
  CONFIRM_DELETE = "CONFIRM_DELETE",
  CONFIRMATION = "CONFIRMATION",
  DEPENDENCY_WARNING = "DEPENDENCY_WARNING",
}

export enum ErrorTypes {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
}
export class ResponseBuilder {
  static success<T>(data?: T): ApiResponse<T> {
    return {
      data,
      meta: {
        requestId: generateToken(10),
        timestamp: new Date().toISOString(),
      },
    };
  }

  static error(type: ErrorTypes, details?: ErrorDetails): ApiResponse {
    return {
      error: { code: type, details: details },
      meta: {
        requestId: generateToken(10),
        timestamp: new Date().toISOString(),
      },
    };
  }

  static permissionError(
    type: ErrorTypes.UNAUTHORIZED,
    details?: ErrorDetails,
  ): ApiResponse {
    return {
      error: { code: type, details: details },
      meta: {
        requestId: generateToken(10),
        timestamp: new Date().toISOString(),
      },
    };
  }

  static conflict(
    type: ErrorTypes,
    actionRequired?: ApiResponse["actionRequired"],
    details?: any,
    filler?: any,
  ): ApiResponse {
    return {
      error: { code: type, details: details, filler: filler },
      actionRequired,
      meta: {
        requestId: generateToken(10),
        timestamp: new Date().toISOString(),
      },
    };
  }

  static actionRequired(
    type: ActionTypes,
    message: string,
    force_action?: boolean,
    meta?: DependencyWarningAction,
  ): ApiResponse {
    return {
      actionRequired: {
        type,
        message,
        force_action,
        meta,
      },
      meta: {
        requestId: generateToken(10),
        timestamp: new Date().toISOString(),
      },
    };
  }
}
