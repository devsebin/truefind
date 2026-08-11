import { IDeclaimerInput } from "@/database/otps/otps-db-interface";

export interface IBuildUserObjectInput {
    role: string;
    phone: string;
    phoneVerified: boolean;
    phoneVerifiedAt: Date;
    user_location?: string;
    user_country?: string;
    user_region?: string;
    user_city?: string;
    last_login?: Date;
    declaimer?: IDeclaimerInput[];
}

export function buildUserObject(input: IBuildUserObjectInput): any {
    return {
        role: input.role,
        phone: input.phone,
        phoneVerified: input.phoneVerified,
        phoneVerifiedAt: input.phoneVerifiedAt,
        user_location: input.user_location ?? "",
        user_country: input.user_country ?? "",
        user_region: input.user_region ?? "",
        user_city: input.user_city ?? "",
        last_login: input.last_login ?? new Date(),
        declaimer: input.declaimer ?? [],
        is_active: true,
        is_deleted: false,
    };
}
