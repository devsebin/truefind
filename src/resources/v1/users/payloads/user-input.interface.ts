import { IUser } from "@/database/users/users-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

/**
 * Base payload (all fields optional, strictly from IUser)
 */
export interface IInputUserPayload extends Partial<IUser> { }

/**
 * Strict payload
 * - only IUser keys allowed
 * - required business fields enforced
 */
export interface IInputUserPayloadStrict extends Strict<
    Partial<IUser> &
    Required<
        Pick<
            IUser,
            "role" | "phoneVerified" | "is_active" | "is_deleted" | "status_id"
        >
    >
> { }

export interface IUserBasicPayload {
    user_id?: string;
    first_name: string;
    last_name: string;
    business_name?: string;
    year_of_experience?: number;
    street_address?: string;
    city: string;
    zip: string;
    ird_number: string;
    declaimer_id: string;
    is_gst_registered?: boolean;
    gst_number?: string;
}