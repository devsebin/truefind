import { IOtp } from "@/database/otps/otps-db-interface";
import { Types } from "mongoose";

export function otpResponse(otp: IOtp & { _id: Types.ObjectId }) {
    return {
        id: otp._id,
        phone: otp.phoneNumber,
        country: otp.country_code,
        expires_at: otp.expires_at,
    };
}
