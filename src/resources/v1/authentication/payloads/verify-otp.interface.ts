import { IDeclaimerInput } from "@/database/otps/otps-db-interface";

export interface IVerifyOtpInput {
    otp: string;
    declaimers?: IDeclaimerInput[];
    type?: string;
}
