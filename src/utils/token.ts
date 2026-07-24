import jwt, { JwtPayload } from "jsonwebtoken";
import Token from "@/utils/interfaces/token.interface";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { DbTransaction } from "./interfaces/activity-log.interface";
import { IUser } from "@/database/users/users-db-interface";
import { CustomError, errorResponse, ErrorResponse } from "./responses/error.response";

function throwError(message: string, data: any): never {
    const error = new Error() as CustomError;
    error.message = message;
    error.name = "ValidationError";
    error.data = data;
    throw error;
}
import {
    errorMessages,
    statusCodes,
    successMessages,
} from "./definitions/constants/common";
import { SingleResponse, successResponse } from "./responses/success.response";
import { ErrorTypes, ResponseBuilder } from "./helpers/response-builder";
export const createToken = (user: IUser): string => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET as jwt.Secret, {
        expiresIn: "1d",
    });
};

export const generateCustomToken = (userId: string, action: string) => {
    const payload = {
        userId,
        action, // E.g., "verify_email"
        createdAt: Date.now(),
    };

    return jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret, {
        expiresIn: "1h",
    });
};

export const verifyToken = async (
    token: string,
): Promise<jwt.VerifyErrors | Token> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET as jwt.Secret, (err, payload) => {
            if (err) return reject(err);

            resolve(payload as Token);
        });
    });
};

export const verifyRefreshToken = async (token: string) => {
    const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET as jwt.Secret,
        ) as Token;
        return payload;
    } catch (err) {
        // 🔥 Normalize all JWT errors into your system
        throwError(
            "invalid_refresh_token",
            ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
                message: "Invalid or expired refresh token",
                data: {
                    reason: err instanceof Error ? err.message : "unknown_error",
                },
            }),
        );
    }
};

export interface CurrentUser extends JwtPayload {
    id: number;
    email: string;
    status: string;
    role: string;
}

export const verifyGoogleToken = async (
    token: string,
): Promise<SingleResponse | ErrorResponse> => {
    try {
        const DbTransactions: DbTransaction[] = [];

        const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        if (!CLIENT_ID) {
            return {
                result: errorResponse(
                    errorMessages.InvalidCredentials,
                    statusCodes.BadRequest,
                ),
                DbTransaction: [],
            };
        }
        const client = new OAuth2Client(CLIENT_ID);

        // Verify the token
        const tokenPayLoad = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = tokenPayLoad.getPayload();

        // Check if the token is valid
        if (!payload) {
            return {
                result: errorResponse(
                    errorMessages.InvalidCredentials,
                    statusCodes.BadRequest,
                ),
                DbTransaction: [],
            };
        }

        // Return the payload
        return {
            result: successResponse(successMessages.Success, statusCodes.OK, [
                payload,
            ]),
            DbTransaction: DbTransactions,
        };
    } catch (error) {
        const message = (error as Error).message;
        return {
            result: errorResponse(
                errorMessages.SomethingWentWrong,
                statusCodes.InternalServerError,
                [message],
            ),
            DbTransaction: [],
        };
    }
};

export default {
    createToken,
    verifyToken,
    verifyRefreshToken,
    verifyGoogleToken,
};
