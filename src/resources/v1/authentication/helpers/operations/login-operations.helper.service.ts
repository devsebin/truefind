import { ClientSession, Model } from "mongoose";
import User from "@/database/users/users-db-model";
import { IUser } from "@/database/users/users-db-interface";
import {
    signRefresh,
    signVerification,
    verifyToken,
    hashToken,
} from "@/utils/helpers/authentication.helper";
import { throwError } from "../../authentication.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { authenticationErrors } from "../../authentication.messages";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import crypto from "crypto";
import { Request } from "express";
import { UAParser } from "ua-parser-js";
import RefreshSessionModel from "@/database/auth-sessions/auth-session-db-model";

class loginOperationsHelperService {
    private readonly userRepository: Model<IUser>;

    constructor() {
        this.userRepository = User;
    }

    public async generateTokens(user: any) {
        try {
            const tokenId = crypto.randomUUID();
            const accessToken = signVerification(
                {
                    jti: tokenId,
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
                "7d",
            );

            const refreshToken = signRefresh(
                {
                    jti: tokenId,
                    id: user.id,
                },
                "7d",
            );

            const decoded = await verifyToken(accessToken);

            if (!decoded) {
                const response = ResponseBuilder.error(ErrorTypes.UNAUTHORIZED, {
                    message: "Invalid token",
                    data: {},
                    filler: {},
                });

                throwError("invalid_token", response);
            }

            return {
                accessToken,
                refreshToken,
                tokenId,
                expiresAt: decoded.exp,
            };
        } catch (error) {
            rethrowIfKnown(error, "Error while generating tokens", authenticationErrors);
        }
    }

    public async storeRefreshToken(
        refreshToken: string,
        user: IUser,
        session: ClientSession,
        DbTransactions: DbTransaction[],
    ): Promise<void> {
        try {
            const doc = await this.userRepository
                .updateOne({ _id: user._id }, { $set: { refresh_token: refreshToken } })
                .session(session)
                .exec();

            DbTransactions.push(
                await createDbTransaction(
                    tableName.User,
                    apiMethods.POST,
                    operationTypes.Login,
                    doc,
                ),
            );
            return;
        } catch (error) {
            rethrowIfKnown(error, "Error while storing refresh token", authenticationErrors);
        }
    }

    public async createAuthSession(
        user: IUser,
        tokens: { refreshToken: string; tokenId: string; expiresAt: number },
        req: Request,
        session: ClientSession,
        DbTransactions: DbTransaction[],
    ): Promise<void> {
        try {
            const deviceId = (req.body.device_id as string) || (req.headers["x-device-id"] as string) || (req.headers["device-id"] as string);
            const deviceName = (req.body.device_name as string) || (req.headers["x-device-name"] as string) || (req.headers["device-name"] as string);

            if (!deviceId) {
                const response = ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
                    message: "Device ID is required to create a session",
                });
                throwError("auth_session_not_created", response);
            }

            const userAgent = (req.headers["user-agent"] as string) || "";
            const parser = new UAParser(userAgent);
            const uaResult = parser.getResult();

            let deviceType: "mobile" | "desktop" | "tablet" = "desktop";
            if (uaResult.device.type === "mobile") {
                deviceType = "mobile";
            } else if (uaResult.device.type === "tablet") {
                deviceType = "tablet";
            }

            const ipAddress = req.geoData?.query || req.ip || "::1";

            const sessionData = {
                userId: user._id,
                refreshTokenHash: hashToken(tokens.refreshToken),
                tokenId: tokens.tokenId,
                deviceId,
                deviceName: deviceName || uaResult.browser.name || "Unknown Device",
                device: {
                    userAgent,
                    browser: uaResult.browser.name ? `${uaResult.browser.name} ${uaResult.browser.version || ""}`.trim() : "",
                    os: uaResult.os.name ? `${uaResult.os.name} ${uaResult.os.version || ""}`.trim() : "",
                    deviceType,
                },
                ipAddress,
                location: {
                    country: req.geoData?.country || "",
                    city: req.geoData?.city || "",
                },
                isRevoked: false,
                expiresAt: new Date(tokens.expiresAt * 1000),
                lastUsedAt: new Date(),
            };

            const doc = await RefreshSessionModel.findOneAndUpdate(
                { userId: user._id, deviceId },
                { $set: sessionData },
                { upsert: true, new: true, runValidators: true, session }
            ).exec();

            DbTransactions.push(
                await createDbTransaction(
                    tableName.RefreshSessions,
                    apiMethods.POST,
                    operationTypes.Login,
                    doc,
                ),
            );
        } catch (error) {
            rethrowIfKnown(error, "Error while creating auth session", authenticationErrors);
        }
    }
}

export default new loginOperationsHelperService();
