import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { CustomError } from "@/utils/responses/error.response";
import { successResponse } from "@/utils/responses/success.response";
import { ApiResponse } from "@/utils/responses/api.response";
import {
    districtErrorsMessages,
    districtSuccessMessages,
} from "./districts.messages";

export function districtPayload(
    type: keyof typeof districtSuccessMessages,
    data: any = [],
    DbTransaction: DbTransaction[] = [],
) {
    const { message, status } = districtSuccessMessages[type];
    return {
        result: successResponse(message, status, data),
        DbTransaction: DbTransaction,
    };
}

export function throwError<T = any>(
    message: keyof typeof districtErrorsMessages,
    data: ApiResponse<T>,
): never {
    const error = new Error() as CustomError;
    error.message = message as string;
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
        path: "country_id",
        select: "name iso_code",
    },
    {
        path: "region_id",
        select: "name code",
    },
];

export function buildPopulateQuery(reqQuery: any) {
    return {
        ...reqQuery,
        populate: populateFields,
    };
}
