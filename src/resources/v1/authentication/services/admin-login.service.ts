import mongoose from "mongoose";
import {
    buildErrorResult,
    ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { authenticationErrors } from "../authentication.messages";
import {
    AuthenticationSuccessResponse,
} from "../authentication.helper";

import findUserHelperService from "../helpers/validators/find-user.helper.service";
import loginOperationsHelperService from "../helpers/operations/login-operations.helper.service";
import findStatusHelperService from "../../masters/statuses/helpers/validators/find-status.helper.service";
import { Request } from "express";

class loginAdminService {
    public async execute(
        req: Request,
    ): Promise<SingleResponse | ErrorResponse> {
        const { email, password } = req.body;
        const session = await mongoose.startSession();
        const DbTransactions: DbTransaction[] = [];

        try {
            session.startTransaction();

            const activeStatus = await findStatusHelperService.execute({ label: "active" }, authenticationErrors, {
                throwIfNotFound: true,
                throwIfExists: false,
                returnDocument: true,
                lean: false,
                select: {
                    _id: 1
                },
                session,
            });

            const user = await findUserHelperService.findAdminUser(email, session, activeStatus[0]._id);
            await findUserHelperService.validatePassword(password, user);

            const tokens = await loginOperationsHelperService.generateTokens(user);
            if (!tokens) {
                throw new Error("Failed to generate tokens");
            }

            const result = {
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                tokenType: "Bearer",
            };

            await loginOperationsHelperService.storeRefreshToken(
                tokens.refreshToken,
                user,
                session,
                DbTransactions,
            );

            await loginOperationsHelperService.createAuthSession(
                user,
                tokens,
                req,
                session,
                DbTransactions,
            );

            await session.commitTransaction();

            return AuthenticationSuccessResponse("admin_login", result, DbTransactions);
        } catch (error) {
            await session.abortTransaction();

            const err = error as Error & { data?: any };
            return buildErrorResult(err.message, authenticationErrors, err.data);
        } finally {
            session.endSession();
        }
    }
}

export default new loginAdminService();
