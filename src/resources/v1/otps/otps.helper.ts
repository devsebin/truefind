import { ApiResponse } from "@/utils/responses/api.response";
import { CustomError } from "@/utils/responses/error.response";
import { otpsErrors } from "./otps.messages";

export function throwError<T = any>(
    message: keyof typeof otpsErrors,
    data: ApiResponse<T>,
): never {
    const error = new Error() as CustomError;
    error.message = message;
    error.name = "ValidationError";
    error.data = data;
    throw error;
}
