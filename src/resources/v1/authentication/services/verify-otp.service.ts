import mongoose from "mongoose";

import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { AuthenticationSuccessResponse } from "../authentication.helper";
import {
    buildErrorResult,
    ErrorResponse,
} from "@/utils/responses/error.response";
import { authenticationErrors } from "../authentication.messages";
import { SingleResponse } from "@/utils/responses/success.response";
import { Request } from "express";

import otpOperationsHelperService from "@/resources/v1/otps/helpers/otp-operations.helper.service";
import findUserHelperService from "../helpers/validators/find-user.helper.service";
import loginOperationsHelperService from "../helpers/operations/login-operations.helper.service";
import createUserService from "@/resources/v1/users/services/create-user.service";
import { buildUserObject } from "../helpers/supports/user-helper";
import otpValidationHelperService from "../helpers/validators/otp-validation.helper.service";

class VerifyOtpService {
    async execute(
        req: Request,
    ): Promise<SingleResponse | ErrorResponse> {
        const otp_id = new mongoose.Types.ObjectId(req.params.id as string);
        const { otp } = req.body;

        const dbTransactions: DbTransaction[] = [];
        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            /* ---------------- VALIDATE OTP ---------------- */
            // a. validateOTP
            const otpDoc = await otpOperationsHelperService.validateOTP(otp_id, session);

            // b. checkOtpState
            await otpOperationsHelperService.checkOtpState(otpDoc, session);

            // c. verifyRateLimit
            await otpOperationsHelperService.verifyRateLimit(otpDoc, session);

            // d. compareAndProcessOTP
            await otpOperationsHelperService.compareAndProcessOTP(otp, otpDoc, session);

            let user: any;

            if (otpDoc.otp_type === "register") {
                /* ---------------- REGISTER FLOW ---------------- */
                // a. make sure that user not exist with same phone number
                await findUserHelperService.ensureUserDoesNotExist(otpDoc.phoneNumber, session);

                // b. validate the declaimer ids from otp collections is valid or not. 
                // is any of the declaimer ids are not valid return an error response with specifying which declaimer ids are not valid
                await otpValidationHelperService.validateDeclaimers(otpDoc.declaimers, session);

                // c. create a user object with a common helper function
                const userObject = buildUserObject({
                    role: otpDoc.user_type,
                    phone: otpDoc.phoneNumber,
                    phoneVerified: true,
                    phoneVerifiedAt: new Date(),
                    country_id: null,
                    region_id: null,
                    district_id: null,
                    suburb_id: null,
                    last_login: new Date(),
                    declaimer: otpDoc.declaimers,
                });

                // d. create user using the create_user function from the user module
                user = await createUserService.execute(userObject, session, dbTransactions);
            } else if (otpDoc.otp_type === "login") {
                /* ---------------- LOGIN FLOW ---------------- */
                // a. find if the user exists. If not, return error (findUserByPhone throws if not found)
                const userDoc = await findUserHelperService.findUserByPhone(otpDoc.phoneNumber, otpDoc.user_type, session);
                user = userDoc;
            }

            // e. create auth session and tokens 
            const tokens = await loginOperationsHelperService.generateTokens(user);
            if (!tokens) {
                throw new Error("Failed to generate tokens");
            }

            await loginOperationsHelperService.storeRefreshToken(
                tokens.refreshToken,
                user,
                session,
                dbTransactions,
            );

            // Ensure device_id is available from the OTP document if not present in request
            if (!req.body.device_id && !req.headers["x-device-id"] && !req.headers["device-id"]) {
                req.body.device_id = otpDoc.device_id;
            }

            await loginOperationsHelperService.createAuthSession(
                user,
                tokens,
                req,
                session,
                dbTransactions,
            );

            const result = {
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                tokenType: "Bearer",
            };

            await session.commitTransaction();

            // f. return success response as same as admin-login.service
            return AuthenticationSuccessResponse("otp_verified_successfully", result, dbTransactions);
        } catch (error) {
            await session.abortTransaction();
            const err = error as Error & { data?: any };
            return buildErrorResult(err.message, authenticationErrors, err.data);
        } finally {
            session.endSession();
        }
    }
}

export default new VerifyOtpService();
