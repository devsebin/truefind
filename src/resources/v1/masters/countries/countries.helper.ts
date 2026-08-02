// utils/tokenErrorHelper.ts
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { CustomError } from "@/utils/responses/error.response";
import { successResponse } from "@/utils/responses/success.response";
import { ApiResponse } from "@/utils/responses/api.response";
import {
    countryErrorsMessages,
    countrySuccessMessages,
} from "./countries.messages";

export function countryPayload(
    type: keyof typeof countrySuccessMessages,
    data: any = [],
    DbTransaction: DbTransaction[] = [],
) {
    const { message, status } = countrySuccessMessages[type];
    return {
        result: successResponse(message, status, data),
        DbTransaction: DbTransaction,
    };
}

export function throwError<T = any>(
    message: keyof typeof countryErrorsMessages,
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
    {
        path: "providers.provider_id",
        select: "name is_active supportedCountries",
    },
    {
        path: "region_ids",
    },
];

export function buildPopulateQuery(reqQuery: any) {
    return {
        ...reqQuery,
        populate: populateFields,
    };
}
