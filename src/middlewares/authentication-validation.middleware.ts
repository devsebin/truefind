import { Request, Response, NextFunction } from "express";
import UserModel from "@/database/users/users-db-model";
import { requestContext } from "@/utils/context/request-context";
import Token from "@/utils/interfaces/token.interface";
import jwt from "jsonwebtoken";
import {
    errorMessages,
    statusCodes,
} from "@/utils/definitions/constants/common";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { errorResponse } from "@/utils/responses/error.response";
import token from "@/utils/token";
import RefreshSessionModel from "@/database/auth-sessions/auth-session-db-model";

async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> {
    const bearer = req.headers.authorization;

    if (!bearer || !bearer.startsWith("Bearer ")) {
        return res
            .status(statusCodes.Unauthorized)
            .json(
                errorResponse(
                    errorMessages.AuthenticationRequired,
                    statusCodes.Unauthorized,
                    [
                        {
                            code: ErrorTypes.UNAUTHORIZED,
                            message: "Authorization header is missing or malformed. Please provide a valid Bearer token.",
                        }
                    ]
                ),
            );
    }

    const accessToken = bearer.split("Bearer ")[1].trim();
    try {
        const payload: Token | jwt.JsonWebTokenError =
            await token.verifyToken(accessToken);

        if (payload instanceof jwt.JsonWebTokenError) {
            return res
                .status(statusCodes.Unauthorized)
                .json(
                    errorResponse(
                        errorMessages.AuthenticationRequired,
                        statusCodes.Unauthorized,
                    ),
                );
        }

        if (payload.jti) {
            const session = await RefreshSessionModel.findOne({
                tokenId: payload.jti,
            });
            if (!session || session.isRevoked) {
                const response = ResponseBuilder.permissionError(
                    ErrorTypes.UNAUTHORIZED,
                    {
                        message: "You are not logged in. Please log in to continue.",
                    },
                );
                return res
                    .status(statusCodes.Unauthorized)
                    .json(
                        errorResponse(
                            errorMessages.AuthenticationRequired,
                            statusCodes.Unauthorized,
                            [response],
                        ),
                    );
            }
        }

        const user = await UserModel.findById(payload.id)
            .select("-password")
            .populate("role")
            .exec();

        if (!user) {
            return res
                .status(statusCodes.Unauthorized)
                .json(
                    errorResponse(
                        errorMessages.AuthenticationRequired,
                        statusCodes.Unauthorized,
                    ),
                );
        }

        req.user = user;

        const store = requestContext.getStore();
        if (store) {
            store.userId = user.id;
        }

        return next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res
                .status(statusCodes.Unauthorized)
                .json(
                    errorResponse(
                        errorMessages.AuthenticationRequired,
                        statusCodes.Unauthorized,
                    ),
                );
        }
        return res
            .status(statusCodes.Unauthorized)
            .json(
                errorResponse(errorMessages.SomethingWentWrong, statusCodes.BadRequest),
            );
    }
}

export default authenticate;
