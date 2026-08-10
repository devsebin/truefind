import mongoose, { ClientSession, Model } from "mongoose";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import OtpModel from "@/database/otps/otps-db-model";
import { IOtp, IDeclaimerInput } from "@/database/otps/otps-db-interface";
import { DeclaimerModel } from "@/database/declaimers/declaimers-db-model";
import { IDeclaimer } from "@/database/declaimers/declaimers-db-interface";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../authentication.helper";
import { authenticationErrors } from "../../authentication.messages";
import { rethrowIfKnown } from "@/utils/responses/error.response";

const OTP_COOLDOWN_SECONDS = 30;
const OTP_MAX_REQUESTS = 5; // per window
const OTP_WINDOW_MINUTES = 10;

class OtpValidationHelperService {
    private readonly otpRepository: Model<IOtp>;
    private readonly declaimerRepository: Model<IDeclaimer>;

    constructor() {
        this.otpRepository = OtpModel;
        this.declaimerRepository = DeclaimerModel;
    }

    public async normalizePhone(
        phone: string,
        country: any,
    ): Promise<string> {
        try {
            const phoneNumber = parsePhoneNumberFromString(
                phone,
                country.iso_code.toUpperCase() as any,
            );

            if (!phoneNumber || !phoneNumber.isValid()) {
                const response = ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
                    message: "Invalid phone number format",
                    data: { phoneNumber: phone, countryCode: country.iso_code.toUpperCase() },
                    filler: {
                        phoneNumber: phone,
                        countryCode: country.iso_code.toUpperCase(),
                    },
                });
                throwError("invalid_phone_number", response);
            }

            if (phoneNumber.country !== country.iso_code.toUpperCase()) {
                const response = ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
                    message: "Phone number does not match the provided country code",
                    data: { phoneNumber: phone, countryCode: country.iso_code },
                    filler: { phoneNumber: phone, countryCode: country.iso_code },
                });
                throwError("phone_country_mismatch", response);
            }

            return phoneNumber.number; // normalized E.164
        } catch (error) {
            rethrowIfKnown(error, "Error normalizing phone", authenticationErrors);
        }
    }

    public async validateDeclaimers(
        declaimers: IDeclaimerInput[],
        session: ClientSession,
    ): Promise<void> {
        try {
            const ids = declaimers.map((d) => d.declaimer_id);

            const dbDeclaimers = await this.declaimerRepository
                .find({
                    _id: { $in: ids },
                    is_active: true,
                })
                .session(session);

            // Check if all exist
            if (dbDeclaimers.length !== ids.length) {
                const response = ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
                    message: "One or more declaimer IDs are invalid",
                    data: { provided: ids },
                });
                throwError("invalid_declaimer_ids", response);
            }
        } catch (error) {
            rethrowIfKnown(
                error,
                "Error validating declaimers",
                authenticationErrors,
            );
        }
    }

    public async checkOtpRateLimits(
        phoneE164: string,
        session: ClientSession,
    ): Promise<void> {
        const now = new Date();
        const windowStart = new Date(
            now.getTime() - OTP_WINDOW_MINUTES * 60 * 1000,
        );

        const result = await this.otpRepository
            .aggregate([
                {
                    $match: { phoneNumber: phoneE164, createdAt: { $gte: windowStart } },
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        lastCreated: { $max: "$createdAt" },
                    },
                },
            ])
            .session(session);

        const count = result[0]?.count || 0;
        const lastCreated = result[0]?.lastCreated
            ? new Date(result[0].lastCreated)
            : null;

        // Cooldown check
        if (lastCreated) {
            const secondsSinceLast = (now.getTime() - lastCreated.getTime()) / 1000;
            if (secondsSinceLast < OTP_COOLDOWN_SECONDS) {
                const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
                    message: "OTP cooldown active. Please wait before requesting again.",
                    data: {
                        phoneNumber: phoneE164,
                        cooldownSeconds: Math.ceil(OTP_COOLDOWN_SECONDS - secondsSinceLast),
                    },
                    filler: {
                        phoneNumber: phoneE164,
                        cooldownSeconds: Math.ceil(OTP_COOLDOWN_SECONDS - secondsSinceLast),
                    },
                });
                throwError("otp_cooldown_active", response);
            }
        }

        if (count >= OTP_MAX_REQUESTS) {
            const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
                message: "OTP request limit exceeded. Please try again later.",
                data: { phoneNumber: phoneE164, windowMinutes: OTP_WINDOW_MINUTES },
                filler: { phoneNumber: phoneE164, windowMinutes: OTP_WINDOW_MINUTES },
            });
            throwError("otp_rate_limit_exceeded", response);
        }
    }
}

export default new OtpValidationHelperService();
