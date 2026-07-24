import { IAuthSession } from "@/database/auth-sessions/auth-session-db-interface";
import RefreshSessionModel from "@/database/auth-sessions/auth-session-db-model";
import { IUser } from "@/database/users/users-db-interface";
import findAuthSessionHelperService from "../../auth-sessions/helpers/validators/find-auth-session.helper.service";
import findUserHelperService from "../../users/helpers/validators/find-user.helper.service";
import {
    compareToken,
    generateTokens,
    hashToken,
} from "@/utils/helpers/authentication.helper";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
    buildErrorResult,
    ErrorResponse,
    rethrowIfKnown,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose, { HydratedDocument, Model } from "mongoose";
import {
    AuthenticationSuccessResponse,
    throwError,
} from "../authentication.helper";
import { authenticationErrors } from "../authentication.messages";
import Token from "@/utils/interfaces/token.interface";
import token from "@/utils/token";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import jwt from "jsonwebtoken";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { Request } from "express";
class RefreshTokenService {
    private readonly authSessionRepository: Model<IAuthSession>;

    constructor() {
        this.authSessionRepository = RefreshSessionModel;
    }

    public async execute(
        req: Request,
        refreshToken: string,
    ): Promise<SingleResponse | ErrorResponse> {
        const session = await mongoose.startSession();
        const dbTransactions: DbTransaction[] = [];

        try {
            session.startTransaction();

            const payload = await this.verifyToken(refreshToken);
            const authSessions = await findAuthSessionHelperService.execute(
                {
                    tokenId: payload.jti,
                    deviceId: req.body.device_id,
                    deviceName: req.body.device_name
                },
                authenticationErrors,
                { session, throwIfNotFound: true },
            );
            const authSession = authSessions[0];

            const users = await findUserHelperService.execute(
                { _id: payload.id },
                authenticationErrors,
                { session, throwIfNotFound: true },
            );
            const user = users[0];

            await this.validateSession(authSession, payload.id);

            await this.validateTokenMatch(
                refreshToken,
                authSession.refreshTokenHash,
                payload.id,
            );

            const tokens = generateTokens(user, authSession.tokenId);

            await this.rotateSession(authSession, tokens, session, dbTransactions);

            await session.commitTransaction();

            return AuthenticationSuccessResponse(
                "token_refreshed",
                {
                    user,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    tokenType: "Bearer",
                },
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

    // ========================= PRIVATE METHODS =========================

    private async verifyToken(refreshToken: string): Promise<Token> {
        const payload = await token.verifyRefreshToken(refreshToken);
        if (payload instanceof jwt.JsonWebTokenError) {
            const response = ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
                message: "Invalid refresh token",
            });
            throwError("invalid_refresh_token", response);
        }

        return payload as Token;
    }



    private async validateSession(
        sessionDoc: HydratedDocument<IAuthSession>,
        userId: mongoose.Types.ObjectId,
    ): Promise<void> {
        if (sessionDoc.isRevoked) {
            const response = ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
                message: "Session revoked",
                data: { userId },
            });
            throwError("session_revoked", response);
        }
    }

    private async validateTokenMatch(
        refreshToken: string,
        storedHash: string,
        userId: mongoose.Types.ObjectId,
    ): Promise<void> {
        const isValid = await compareToken(refreshToken, storedHash);

        if (!isValid) {
            // revoke all sessions (security measure)
            await this.authSessionRepository.updateMany(
                { userId },
                { isRevoked: true, revokedAt: new Date() },
            );

            const response = ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
                message: "Invalid refresh token",
            });

            throwError("invalid_refresh_token", response);
        }
    }

    private async rotateSession(
        sessionDoc: HydratedDocument<IAuthSession>,
        tokens: any,
        session: mongoose.ClientSession,
        dbTransactions: DbTransaction[],
    ): Promise<void> {
        try {
            sessionDoc.tokenId = tokens.token_id;
            sessionDoc.refreshTokenHash = await hashToken(tokens.refreshToken);
            sessionDoc.lastUsedAt = new Date();

            await sessionDoc.save({ session });

            dbTransactions.push(
                await createDbTransaction(
                    tableName.RefreshSessions,
                    apiMethods.PUT,
                    operationTypes.Update,
                    sessionDoc.toObject(),
                ),
            );
        } catch (error) {
            rethrowIfKnown(error, "Error rotating session", authenticationErrors);
        }
    }
}

export default new RefreshTokenService();
