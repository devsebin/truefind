import { IDeclaimerInput } from "@/database/otps/otps-db-interface";
import mongoose from "mongoose";

export interface IBuildUserObjectInput {
    role: string;
    phone: string;
    phoneVerified: boolean;
    phoneVerifiedAt: Date;
    country_id?: mongoose.Types.ObjectId | null;
    region_id?: mongoose.Types.ObjectId | null;
    district_id?: mongoose.Types.ObjectId | null;
    suburb_id?: mongoose.Types.ObjectId | null;
    last_login?: Date;
    declaimer?: IDeclaimerInput[];
}

export function buildUserObject(input: IBuildUserObjectInput): any {
    return {
        role: input.role,
        phone: input.phone,
        phoneVerified: input.phoneVerified,
        phoneVerifiedAt: input.phoneVerifiedAt,
        country_id: input.country_id ?? null,
        region_id: input.region_id ?? null,
        district_id: input.district_id ?? null,
        suburb_id: input.suburb_id ?? null,
        last_login: input.last_login ?? new Date(),
        declaimer: input.declaimer ?? [],
        is_active: true,
        is_deleted: false,
    };
}
