import { Request, Response, NextFunction } from "express";
import { api } from "@/database/apis/apis-db-model";
import { errorResponse } from "@/utils/responses/error.response";
import {
    errorMessages,
    statusCodes,
} from "@/utils/definitions/constants/common";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

// Assuming you're attaching the user's role in `req.user.role`
export const authorizationApi = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const apiData = await api.findOne({
            url: convertParamsToId(req.originalUrl.split("?")[0]),
            activity_method: req.method.toLowerCase(),
            status: true,
        });

        if (!apiData) {
            const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
                message: "API not found",
            });
            return res
                .status(statusCodes.BadRequest)
                .json(
                    errorResponse(errorMessages.ApiNotFound, statusCodes.BadRequest, [
                        response,
                    ]),
                );
        }

        const response = ResponseBuilder.permissionError(ErrorTypes.UNAUTHORIZED, {
            message: "You are not authorized to access this resource.",
        });
        if (apiData.required_authentication === false && req.user) {
            return res
                .status(statusCodes.BadRequest)
                .json(
                    errorResponse(
                        errorMessages.InvalidPermission,
                        statusCodes.BadRequest,
                        [response],
                    ),
                );
        }
        if (apiData.required_authentication && (!req.user || !req.user.role)) {
            return res
                .status(statusCodes.BadRequest)
                .json(
                    errorResponse(errorMessages.UserNotFound, statusCodes.BadRequest, [
                        response,
                    ]),
                );
        }

        const userRoleId = (req.user.role as any)?._id || req.user.role;

        const hasAccess = apiData.access_roles?.some(
            (roleId: any) => roleId.toString() === userRoleId.toString()
        ) || false;

        if (!hasAccess) {
            return res
                .status(statusCodes.Unauthorized)
                .json(
                    errorResponse(
                        errorMessages.InvalidPermission,
                        statusCodes.Unauthorized,
                        [response],
                    ),
                );
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Utility function to normalize the URL by replacing dynamic params (e.g., :id)
export const convertParamsToId = (url: string): string => {
    // Regular expression to match MongoDB ObjectIds (24-character hexadecimal strings)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/; // Split the URL into segments
    const urlSegments = url.split("/").filter(Boolean);
    // Replace any parameter that looks like an ObjectId or numeric ID with :id
    const convertedSegments = urlSegments.map((segment) => {
        // Check if the segment is an ID (MongoDB ObjectId or numeric value)
        if (objectIdRegex.test(segment) || !isNaN(Number(segment))) {
            return ":id";
        }
        return segment;
    });

    // Reconstruct the URL with :id in place of detected IDs
    return "/" + convertedSegments.join("/");
};
