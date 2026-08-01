import {
    errorMessages,
    statusCodes,
} from "@/utils/definitions/constants/common";
import { errorResponse } from "@/utils/responses/error.response";
import { JsonResponse } from "@/utils/responses/types";
import { Request, Response } from "express";
import mongoose from "mongoose";
import createActivityLogService from "../../activity-log/services/create-activity-log.service";
import createProvidersService from "./services/create-providers.service";
import listProvidersService from "./services/list-providers.service";
import showProvidersService from "./services/show-providers.service";
import updateProvidersService from "./services/update-providers.service";
import deleteProvidersService from "./services/delete-providers.service";
import enableProvidersService from "./services/enable-providers.service";
import disableProvidersService from "./services/disable-providers.service";

class providersController {
    async Index(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await listProvidersService.execute(req, false);
            return res.status(response.result.code).json(response.result);
        } catch (error: any) {
            const message = (error as Error).message;
            response = {
                result: errorResponse(
                    errorMessages.SomethingWentWrong,
                    statusCodes.InternalServerError,
                    [message],
                ),
                DbTransactions: [],
            };
            res.status(statusCodes.InternalServerError).json(response.result);
        } finally {
            const end = new Date().getTime();
            createActivityLogService.execute(req, res, start, end, response);
        }
    }

    async Store(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await createProvidersService.execute(req);
            return res.status(response.result.code).json(response.result);
        } catch (error: any) {
            const message = (error as Error).message;
            response = {
                result: errorResponse(
                    errorMessages.SomethingWentWrong,
                    statusCodes.InternalServerError,
                    [message],
                ),
                DbTransactions: [],
            };
            res.status(statusCodes.InternalServerError).json(response.result);
        } finally {
            const end = new Date().getTime();
            createActivityLogService.execute(req, res, start, end, response);
        }
    }

    async Show(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await showProvidersService.execute(new mongoose.Types.ObjectId(req.params.id as string));
            return res.status(response.result.code).json(response.result);
        } catch (error: any) {
            const message = (error as Error).message;
            response = {
                result: errorResponse(
                    errorMessages.SomethingWentWrong,
                    statusCodes.InternalServerError,
                    [message],
                ),
                DbTransactions: [],
            };
            res.status(statusCodes.InternalServerError).json(response.result);
        } finally {
            const end = new Date().getTime();
            createActivityLogService.execute(req, res, start, end, response);
        }
    }

    async Update(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await updateProvidersService.execute(
                new mongoose.Types.ObjectId(req.params.id as string),
                req,
            );
            return res.status(response.result.code).json(response.result);
        } catch (error: any) {
            const message = (error as Error).message;
            response = {
                result: errorResponse(
                    errorMessages.SomethingWentWrong,
                    statusCodes.InternalServerError,
                    [message],
                ),
                DbTransactions: [],
            };
            res.status(statusCodes.InternalServerError).json(response.result);
        } finally {
            const end = new Date().getTime();
            createActivityLogService.execute(req, res, start, end, response);
        }
    }

    async Delete(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            const is_force = req.query.force_action ?? false;
            response = await deleteProvidersService.execute(
                new mongoose.Types.ObjectId(req.params.id as string),
                new mongoose.Types.ObjectId(),
                is_force as boolean,
            );
            return res.status(response.result.code).json(response.result);
        } catch (error: any) {
            const message = (error as Error).message;
            response = {
                result: errorResponse(
                    errorMessages.SomethingWentWrong,
                    statusCodes.InternalServerError,
                    [message],
                ),
                DbTransactions: [],
            };
            res.status(statusCodes.InternalServerError).json(response.result);
        } finally {
            const end = new Date().getTime();
            createActivityLogService.execute(req, res, start, end, response);
        }
    }

    async activate(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await enableProvidersService.execute(
                new mongoose.Types.ObjectId(req.params.id as string),
                new mongoose.Types.ObjectId(),
            );
            return res.status(response.result.code).json(response.result);
        } catch (error: any) {
            const message = (error as Error).message;
            response = {
                result: errorResponse(
                    errorMessages.SomethingWentWrong,
                    statusCodes.InternalServerError,
                    [message],
                ),
                DbTransactions: [],
            };
            res.status(statusCodes.InternalServerError).json(response.result);
        } finally {
            const end = new Date().getTime();
            createActivityLogService.execute(req, res, start, end, response);
        }
    }

    async deactivate(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await disableProvidersService.execute(
                new mongoose.Types.ObjectId(req.params.id as string),
                new mongoose.Types.ObjectId(),
            );
            return res.status(response.result.code).json(response.result);
        } catch (error: any) {
            const message = (error as Error).message;
            response = {
                result: errorResponse(
                    errorMessages.SomethingWentWrong,
                    statusCodes.InternalServerError,
                    [message],
                ),
                DbTransactions: [],
            };
            res.status(statusCodes.InternalServerError).json(response.result);
        } finally {
            const end = new Date().getTime();
            createActivityLogService.execute(req, res, start, end, response);
        }
    }
}

export default new providersController();
