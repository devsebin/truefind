import { ApiResponse } from "@/utils/responses/api.response";
import { authenticationErrors, authenticationSuccess } from "./authentication.messages";
import { CustomError, errorResponse } from "@/utils/responses/error.response";
import { successResponse } from "@/utils/responses/success.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";

export function AuthenticationErrorResponse(
    type: keyof typeof authenticationErrors,
    data: any = [],
) {
    const { message, status } = authenticationErrors[type];
    return {
        result: errorResponse(message, status, data),
        DbTransaction: [],
    };
}

export function AuthenticationSuccessResponse(
    type: keyof typeof authenticationSuccess,
    data: any = [],
    DbTransaction: DbTransaction[] = [],
) {
    const { message, status } = authenticationSuccess[type];
    return {
        result: successResponse(message, status, data),
        DbTransaction: DbTransaction,
    };
}

export function throwError<T = any>(
    message: keyof typeof authenticationErrors,
    data: ApiResponse<T>,
): never {
    const error = new Error() as CustomError;
    error.message = message;
    error.name = "ValidationError";
    error.data = data;
    throw error;
}