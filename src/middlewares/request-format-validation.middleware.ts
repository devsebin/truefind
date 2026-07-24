import {
    errorMessages,
    statusCodes,
} from "@/utils/definitions/constants/common";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { errorResponse } from "@/utils/responses/error.response";
import { Request, Response, NextFunction } from "express";

export function validateJson(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    // This middleware is used as an error handler
    if (err instanceof SyntaxError && "body" in err) {
        return res.status(statusCodes.BadRequest).json(
            errorResponse(
                errorMessages.InvalidInput,
                statusCodes.Unauthorized,
                ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
                    message: "Invalid JSON format",
                }),
            ),
        );
    }

    next();
}
