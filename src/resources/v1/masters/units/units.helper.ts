import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { CustomError } from "@/utils/responses/error.response";
import { successResponse } from "@/utils/responses/success.response";
import { ApiResponse } from "@/utils/responses/api.response";
import {
    unitsErrorsMessages,
    unitsSuccessMessages,
} from "./units.messages";

export function unitsPayload(
    type: keyof typeof unitsSuccessMessages,
    data: any = [],
    DbTransaction: DbTransaction[] = [],
) {
    const { message, status } = unitsSuccessMessages[type];
    return {
        result: successResponse(message, status, data),
        DbTransaction: DbTransaction,
    };
}

export function throwError<T = any>(
    message: keyof typeof unitsErrorsMessages,
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
        select: "title",
    },
];

export function buildPopulateQuery(reqQuery: any) {
    return {
        ...reqQuery,
        populate: populateFields,
    };
}
