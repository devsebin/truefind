import { Types } from "mongoose";

export interface IDeclaimerInput {
    declaimer_id: Types.ObjectId; // allow string from API, cast later
    accepted: boolean;
}

export interface IOtp {
    phoneNumber: string;
    country_code: string;
    device_id: string;
    otp_type: string;
    user_type: string;
    otp_hash: string;
    expires_at: Date;
    attempts: number;
    is_used: boolean;
    is_active: boolean;
    last_seen_at: Date;

    declaimers: IDeclaimerInput[]; // ✅ add this

    createdAt: Date; // ✅ add this
    updatedAt: Date; // ✅ add this
}

export interface IOtpDB {
    findOne(query: object): Promise<IOtp | null>;
    create(data: IOtp): Promise<IOtp>;
    updateOne(query: object, data: object): Promise<IOtp | null>;
    deleteOne(query: object): Promise<IOtp | null>;
}

export interface IOtpInput {
    phoneNumber: string;
    country_code: string;
    device_id: string;
    otp_type: string;
    user_type: string;
    otp_hash: string;
    expires_at: Date;
    last_seen_at: Date;
    declaimers: IDeclaimerInput[];
}
