import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { DocumentErrorMessages, DocumentSuccessMessages } from "./documents.messages";
import { successResponse } from "@/utils/responses/success.response";
import { ApiResponse } from "@/utils/responses/api.response";

export function FilesSuccessPayload(
    type: keyof typeof DocumentSuccessMessages,
    data: any = [],
    DbTransaction: DbTransaction[] = [],
) {
    const { message, status } = DocumentSuccessMessages[type];
    return {
        result: successResponse(message, status, data),
        DbTransaction: DbTransaction,
    };
}

export interface CustomError extends Error {
    statusCode?: number;
    data?: any;
}
export function throwError<T = any>(
    message: keyof typeof DocumentErrorMessages,
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
        path: "status_id",
        select: "title",
    },
    {
        path: "created_by",
        select: "first_name middle_name last_name email role",
    },
    {
        path: "updated_by",
        select: "first_name middle_name last_name email role",
    },
    {
        path: "deleted_by",
        select: "first_name middle_name last_name email role",
    },
];

export function buildPopulateQuery(reqQuery: any) {
    return {
        ...reqQuery,
        populate: populateFields,
    };
}