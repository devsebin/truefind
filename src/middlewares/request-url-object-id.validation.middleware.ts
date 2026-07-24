import {
    errorMessages,
    statusCodes,
} from "@/utils/definitions/constants/common";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { errorResponse } from "@/utils/responses/error.response";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export function paramsValidator(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const invalidParams: string[] = [];

    // Collect all invalid param values
    for (const [key, value] of Object.entries(req.params)) {
        if (!mongoose.Types.ObjectId.isValid(value as string)) {
            invalidParams.push(`${value}`);
        }
    }

    const formattedData = {
        0: "Invalid object ids in url params.",
        ...Object.fromEntries(
            invalidParams.map((item, index) => [index + 1, item]),
        ),
    };
    // If any invalid parameters exist, return once here
    if (invalidParams.length > 0) {
        return res.status(statusCodes.BadRequest).json(
            errorResponse(
                errorMessages.InvalidID,
                statusCodes.BadRequest,
                ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
                    message: "Invalid object ids in url params.",
                    data: formattedData,
                }),
            ),
        );
    }

    next(); // All params valid
}
