import mongoose, { ClientSession, Model, Document, HydratedDocument } from "mongoose";
import OtpModel from "@/database/otps/otps-db-model";
import { IOtp, IOtpInput } from "@/database/otps/otps-db-interface";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { otpsErrors } from "../otps.messages";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { throwError } from "../otps.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import bcrypt from "bcrypt";

const MAX_OTP_ATTEMPTS = 5;

class OtpOperationsHelperService {
    private readonly otpRepository: Model<IOtp>;

    constructor() {
        this.otpRepository = OtpModel;
    }

    public async expireOldOtps(
        phoneE164: string,
        session: ClientSession,
    ): Promise<void> {
        try {
            const result = await this.otpRepository.updateMany(
                { phoneNumber: phoneE164, is_active: true },
                { is_active: false, expires_at: new Date() },
                { session },
            );

            if (result.modifiedCount > 0) {
                console.log(
                    `Expired ${result.modifiedCount} old OTP(s) for ${phoneE164}`,
                );
            }
        } catch (error) {
            rethrowIfKnown(error, "Error expiring old OTPs", otpsErrors);
        }
    }

    public async storeOtp(
        object: IOtpInput,
        session: ClientSession,
        dbTransactions: DbTransaction[],
    ): Promise<IOtp & mongoose.Document> {
        try {
            const OtpDocument = new this.otpRepository(object);
            await OtpDocument.save({ session });

            // Log the database transaction
            dbTransactions.push(
                await createDbTransaction(
                    tableName.Otp,
                    apiMethods.POST,
                    operationTypes.Create,
                    OtpDocument,
                ),
            );

            return OtpDocument;
        } catch (error) {
            rethrowIfKnown(error, "Error storing OTP", otpsErrors);
            throw error;
        }
    }

    public async validateOTP(
        otp_id: mongoose.Types.ObjectId,
        session: ClientSession,
    ): Promise<HydratedDocument<IOtp>> {
        try {
            const otp = await this.otpRepository
                .findOne({ _id: otp_id })
                .session(session);

            if (!otp) {
                throwError(
                    "otp_not_found",
                    ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
                        message: "OTP not found",
                        data: { id: otp_id },
                        filler: { 0: otp_id.toString() },
                    }),
                );
            }

            return otp;
        } catch (error) {
            rethrowIfKnown(error, "Error validating OTP", otpsErrors);
            throw error;
        }
    }

    public async checkOtpState(
        otp: IOtp & Document,
        session: ClientSession,
    ): Promise<void> {
        if (otp.is_used) {
            throwError(
                "otp_already_used",
                ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
                    message: "OTP already used",
                }),
            );
        }

        if (!otp.is_active) {
            throwError(
                "otp_inactive",
                ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
                    message: "OTP is inactive",
                }),
            );
        }

        if (new Date() > otp.expires_at) {
            await this.otpRepository
                .updateOne({ _id: otp._id }, { $set: { is_active: false } })
                .session(session);

            throwError(
                "otp_expired",
                ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
                    message: "OTP expired",
                }),
            );
        }
    }

    public async verifyRateLimit(
        otp: IOtp & Document,
        session: ClientSession,
    ): Promise<void> {
        if (otp.attempts >= MAX_OTP_ATTEMPTS) {
            await this.otpRepository
                .updateOne({ _id: otp._id }, { $set: { is_active: false } })
                .session(session);

            throwError(
                "otp_attempt_limit_exceeded",
                ResponseBuilder.error(ErrorTypes.TOO_MANY_REQUESTS, {
                    message: "Maximum OTP attempts exceeded",
                }),
            );
        }
    }

    public async compareAndProcessOTP(
        otp: string,
        document: IOtp & Document,
        session: ClientSession,
    ): Promise<void> {
        try {
            const isMatch = await bcrypt.compare(otp, document.otp_hash);

            if (isMatch) {
                await this.markOtpAsUsed(document, session);
                return;
            }

            await this.incrementAttempts(document);

            throwError(
                "otp_not_valid",
                ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
                    message: "Invalid OTP",
                }),
            );
        } catch (error) {
            rethrowIfKnown(error, "Error comparing OTP", otpsErrors);
            throw error;
        }
    }

    private async markOtpAsUsed(
        otp: IOtp & Document,
        session: ClientSession,
    ): Promise<void> {
        await this.otpRepository
            .updateOne(
                { _id: otp._id },
                {
                    $set: {
                        is_used: true,
                        is_active: false,
                        last_seen_at: new Date(),
                    },
                },
            )
            .session(session);
    }

    private async incrementAttempts(otp: IOtp & Document): Promise<void> {
        const updated = await this.otpRepository.findOneAndUpdate(
            { _id: otp._id },
            {
                $inc: { attempts: 1 },
                $set: { last_seen_at: new Date() },
            },
            { returnDocument: 'after' },
        );

        if (updated && updated.attempts >= MAX_OTP_ATTEMPTS) {
            await this.otpRepository.updateOne(
                { _id: otp._id },
                { $set: { is_active: false } },
            );
        }
    }
}

export default new OtpOperationsHelperService();
