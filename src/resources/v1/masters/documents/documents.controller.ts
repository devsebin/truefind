import { Request, Response } from "express";
import { uploadFileToS3 } from "./helpers/supports/file-upload.helper";
import { errorResponse } from "@/utils/responses/error.response";
import { errorMessages } from "@/utils/definitions/constants/common";
import createActivityLogService from "../../activity-log/services/create-activity-log.service";
import { JsonResponse } from "@/utils/responses/types";
import mongoose from "mongoose";
import deleteDocumentService from "./services/delete-document.service";
import showDocumentService from "./services/show-document.service";
import createDocumentService from "./services/create-document.service";


import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

export async function uploadFile(req: Request, res: Response): Promise<any> {
    const start = new Date().getTime();
    let response: any;
    try {
        if (!req.file) {
            response = {
                result: errorResponse(errorMessages.SomethingWentWrong, 500, [
                    ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
                        message: "File is required",
                    }),
                ]),
                DbTransactions: [],
            };
            return res.status(400).json(response.result);
        }
        // Upload original image to S3
        const uploadResult = await uploadFileToS3(req.file);
        if (uploadResult.result.success === false) {
            return res.status(uploadResult.result.code).send(uploadResult.result);
        }

        uploadResult.result.data[0].result.created_by = req.user.id;

        response = await createDocumentService.execute(
            uploadResult.result.data[0].result,
        );
        return res.status(response.result.code).json(response.result);
    } catch (error) {
        const message = (error as Error).message;
        response = {
            result: errorResponse(errorMessages.SomethingWentWrong, 500, [message]),
            DbTransactions: [],
        };
        res.status(response.result.code).json(response.result);
    } finally {
        const end = new Date().getTime();
        createActivityLogService.execute(req, res, start, end, response);
    }
}

export async function Show(
    req: Request,
    res: Response,
): Promise<JsonResponse | void> {
    const start = new Date().getTime();
    let response: any;
    try {
        const query = req.params.id as string;

        // upload keys into database
        response = await showDocumentService.execute(
            new mongoose.Types.ObjectId(query),
        );
        return res.status(response.result.code).json(response.result);
    } catch (error) {
        const message = (error as Error).message;
        response = {
            result: errorResponse(errorMessages.SomethingWentWrong, 500, [message]),
            DbTransactions: [],
        };
        res.status(response.result.code).json(response.result);
    } finally {
        const end = new Date().getTime();
        createActivityLogService.execute(req, res, start, end, response);
    }
}

export async function Delete(
    req: Request,
    res: Response,
): Promise<JsonResponse | void> {
    const start = new Date().getTime();
    let response: any;
    try {
        const query = req.params.id as string;
        const userId = req.user.id as string;
        // upload keys into database
        response = await deleteDocumentService.execute(
            new mongoose.Types.ObjectId(query),
            new mongoose.Types.ObjectId(userId),
        );
        return res.status(response.result.code).json(response.result);
    } catch (error) {
        const message = (error as Error).message;
        response = {
            result: errorResponse(errorMessages.SomethingWentWrong, 500, [message]),
            DbTransactions: [],
        };
        res.status(response.result.code).json(response.result);
    } finally {
        const end = new Date().getTime();
        createActivityLogService.execute(req, res, start, end, response);
    }
}
