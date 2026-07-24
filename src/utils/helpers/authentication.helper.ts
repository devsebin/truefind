import jwt from "jsonwebtoken";
import crypto from "crypto";
import { IUser } from "@/database/users/users-db-interface";
import { ErrorTypes, ResponseBuilder } from "./response-builder";
import { CustomError } from "../responses/error.response";

function throwError(message: string, data: any): never {
    const error = new Error() as CustomError;
    error.message = message;
    error.name = "ValidationError";
    error.data = data;
    throw error;
}

/**
 * Signs a JSON Web Token (JWT) with the given payload and expiration time.
 *
 * @param payload - The data to be encoded in the JWT.
 * @param expiresIn - The expiration time for the token (e.g., "1h", "2d").
 * @returns A signed JWT as a string.
 */

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const generateTokens = (user: IUser, existingTokenId?: string) => {
    if (!ACCESS_SECRET || !REFRESH_SECRET)
        throwError(
            "tokens_not_defined",
            ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
                message: "Invalid tokens",
            }),
        );

    if (!user) {
        throwError(
            "user_not_found",
            ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
                message: "User not found",
            }),
        );
    }

    const token_id = existingTokenId || crypto.randomUUID();

    const accessToken = jwt.sign(
        {
            jti: token_id,
            id: user._id,
            role: user.role,
        },
        ACCESS_SECRET,
        {
            expiresIn: "15m",
        },
    );

    const refreshToken = jwt.sign(
        {
            jti: token_id,
            id: user._id,
        },
        REFRESH_SECRET,
        {
            expiresIn: "7d",
        },
    );

    return { accessToken, refreshToken, token_id };
};

export const signVerification = (payload: object, expiresIn: any) => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn,
    });
};

export const signRefresh = (payload: object, expiresIn: any) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn,
    });
};

export const verifyToken = async (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.JWT_SECRET as string,
            function (err, decoded) {
                if (err) {
                    reject(err);
                }
                resolve(decoded);
            },
        );
    });
};

export const verifyRefreshToken = async (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET as string,
            function (err, decoded) {
                if (err) {
                    reject(err);
                }
                resolve(decoded);
            },
        );
    });
};
export function hashToken(token: string): string {
    return crypto
        .createHmac("sha256", process.env.TOKEN_SECRET! as string)
        .update(token)
        .digest("hex");
}

export function compareToken(token: string, hash: string): boolean {
    const hashedInput = hashToken(token);
    const a = Buffer.from(hashedInput, "utf8");
    const b = Buffer.from(hash, "utf8");

    // ✅ prevent crash
    if (a.length !== b.length) {
        return false;
    }

    return crypto.timingSafeEqual(Buffer.from(hashedInput), Buffer.from(hash));
}
