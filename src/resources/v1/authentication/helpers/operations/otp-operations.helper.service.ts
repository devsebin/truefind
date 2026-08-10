import mongoose, { ClientSession, Model, Document } from "mongoose";
import OtpModel from "@/database/otps/otps-db-model";
import { IOtp, IOtpInput } from "@/database/otps/otps-db-interface";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { authenticationErrors } from "../../authentication.messages";
import { rethrowIfKnown } from "@/utils/responses/error.response";

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
            rethrowIfKnown(error, "Error expiring old OTPs", authenticationErrors);
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
            rethrowIfKnown(error, "Error storing OTP", authenticationErrors);
        }
    }
}

export default new OtpOperationsHelperService();
