import { IOtp } from "@/database/otps/otps-db-interface";

export function otpResponse(otp: IOtp) {
    return {
        phone: otp.phoneNumber,
        country: otp.country_code,
        expires_at: otp.expires_at,
    };
}
