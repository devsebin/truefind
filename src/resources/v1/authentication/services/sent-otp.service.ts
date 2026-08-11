import { tableName } from "@/utils/definitions/constants/table-names";
import mongoose, { Model } from "mongoose";
import CountryModel from "@/database/countries/countries-db-model";
import { IOtp, IOtpInput, IDeclaimerInput } from "@/database/otps/otps-db-interface";
import { generateOTP, generateOTPExpiry } from "@/utils/helpers/otp-helper";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
    AuthenticationSuccessResponse,
    throwError,
} from "../authentication.helper";
import { otpResponse } from "../authentication.response";
import {
    buildErrorResult,
    ErrorResponse,
} from "@/utils/responses/error.response";
import { authenticationErrors } from "../authentication.messages";
import { SingleResponse } from "@/utils/responses/success.response";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import bcrypt from "bcrypt";
import { ProviderModel } from "@/database/providers/providers-db-model";
import { HandlerRegistry } from "@/resources/v1/masters/providers/helpers/support/handler.registry";

// Helper Services
import findUserHelperService from "../helpers/validators/find-user.helper.service";
import otpValidationHelperService from "../helpers/validators/otp-validation.helper.service";
import otpOperationsHelperService from "@/resources/v1/otps/helpers/otp-operations.helper.service";
import findCountryHelperService from "../../masters/countries/helpers/validators/find-country.helper.service";

interface Options {
    phone: string;
    country: string;
    device_id: string;
    type: string;
    user_type: string;
    declaimers: IDeclaimerInput[];
}

const OTP_EXPIRY_MINUTES = 5;

class OtpService {
    private countryRepository: Model<any>;

    constructor() {
        this.countryRepository = CountryModel;
    }

    async execute(object: Options): Promise<SingleResponse | ErrorResponse> {
        const dbTransactions: DbTransaction[] = [];
        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            // Fetch Country
            const countries = await findCountryHelperService.execute(
                { iso_code: object.country.toUpperCase() },
                {},
                {
                    throwIfNotFound: true,
                    session,
                }
            );

            const country = countries[0];

            // Normalize phone number using helper validation service
            const phoneE164 = await otpValidationHelperService.normalizePhone(
                object.phone,
                country,
            );

            if (object.type === "register") {
                await findUserHelperService.ensureUserDoesNotExist(phoneE164, session);
                await otpValidationHelperService.validateDeclaimers(object.declaimers, session);
            }

            if (object.type === "login") {
                await findUserHelperService.findUserByPhone(phoneE164, object.user_type, session);
            }

            // Select active SMS provider
            const countryProviders = country.providers || [];
            const defaultCountryProviders = countryProviders.filter((p: any) => p.is_default);
            const otherCountryProviders = countryProviders.filter((p: any) => !p.is_default);

            let selectedProvider: any = null;
            let selectedLinkedCountry: any = null;

            const checkProviders = async (list: any[]) => {
                for (const cp of list) {
                    const provider = await ProviderModel.findOne({
                        _id: cp.provider_id,
                        is_active: true,
                        is_deleted: false,
                    }).session(session);

                    if (provider) {
                        const linked = provider.supportedCountries.find(
                            (sc: any) => sc.countryId.toString() === country._id.toString()
                        );

                        if (linked && linked.is_active) {
                            const smsType = linked.type.find(
                                (t: any) => t.name === "SMS" && t.is_tested && t.is_active
                            );
                            if (smsType) {
                                selectedProvider = provider;
                                selectedLinkedCountry = linked;
                                break;
                            }
                        }
                    }
                }
            };

            // First check defaults
            await checkProviders(defaultCountryProviders);

            // If not found, check others
            if (!selectedProvider) {
                await checkProviders(otherCountryProviders);
            }

            if (!selectedProvider) {
                const response = ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
                    message: "No active SMS provider found for the country.",
                });
                throwError("otp_not_supported", response);
            }

            // Apply OTP rate limits & cool-down using helper validation service
            await otpValidationHelperService.checkOtpRateLimits(phoneE164, session);

            // Expire old OTPs using helper operations service
            await otpOperationsHelperService.expireOldOtps(phoneE164, session);

            // Generate OTP
            const otp = await generateOTP();

            // Fetch and instantiate handler
            const HandlerClass = HandlerRegistry.get(
                selectedProvider.name,
                country.iso_code,
                "SMS",
            );
            const handlerInstance = new HandlerClass(selectedLinkedCountry.config);

            // Send SMS
            let sendResult;
            try {
                sendResult = await handlerInstance.sendMessage({
                    phone: phoneE164,
                    message: `Your OTP code is ${otp}. It is valid for ${OTP_EXPIRY_MINUTES} minutes.`,
                });
            } catch (sendError: any) {
                const response = ResponseBuilder.error(ErrorTypes.INTERNAL_SERVER_ERROR, {
                    message: sendError.message || "Failed to send OTP SMS via provider",
                });
                throwError("SomethingWentWrong", response);
            }

            if (sendResult && sendResult.success === false) {
                const response = ResponseBuilder.error(ErrorTypes.INTERNAL_SERVER_ERROR, {
                    message: sendResult.message || "Failed to send OTP SMS via provider",
                });
                throwError("SomethingWentWrong", response);
            }

            const otpDocument: IOtpInput = {
                phoneNumber: phoneE164,
                country_code: object.country,
                device_id: object.device_id,
                otp_type: object.type,
                user_type: object.user_type,
                otp_hash: await bcrypt.hash(otp, 10),
                expires_at: generateOTPExpiry(OTP_EXPIRY_MINUTES),
                last_seen_at: new Date(),
                declaimers: object.declaimers,
            };

            // Store OTP using helper operations service
            const otpDocumentSaved = await otpOperationsHelperService.storeOtp(
                otpDocument,
                session,
                dbTransactions,
            );

            await session.commitTransaction();
            console.log("Sent OTP code (development print):", otp);
            return AuthenticationSuccessResponse(
                "otp_sent_successfully",
                otpResponse(otpDocumentSaved),
                dbTransactions,
            );
        } catch (error) {
            await session.abortTransaction();
            const err = error as Error & { data?: any };
            return buildErrorResult(err.message, authenticationErrors, err.data);
        } finally {
            session.endSession();
        }
    }
}

export default new OtpService();
