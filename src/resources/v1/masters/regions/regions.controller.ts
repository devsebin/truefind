import { JsonResponse } from "@/utils/responses/types";
import createActivityLogService from "../../activity-log/services/create-activity-log.service";
import { Request, Response } from "express";
import { errorResponse } from "@/utils/responses/error.response";
import {
    errorMessages,
    statusCodes,
} from "@/utils/definitions/constants/common";
import mongoose from "mongoose";
import createRegionService from "./services/create-region.service";
import updateRegionService from "./services/update-region.service";
import deleteRegionService from "./services/delete-region.service";
import showRegionService from "./services/show-region.service";
import listRegionService from "./services/list-region.service";
import activateRegionService from "./services/activate-region.service";
import deactivateRegionService from "./services/deactivate-region.service";

class regionController {
    public async Store(
        req: Request,
        res: Response,
    ): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await createRegionService.execute(req);
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

    public async Update(
        req: Request,
        res: Response,
    ): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await updateRegionService.execute(
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

    public async Delete(
        req: Request,
        res: Response,
    ): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            const is_force = req.query.force_action ?? false;
            response = await deleteRegionService.execute(
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

    public async Show(
        req: Request,
        res: Response,
    ): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await showRegionService.execute(
                new mongoose.Types.ObjectId(req.params.id as string),
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

    public async Index(
        req: Request,
        res: Response,
    ): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await listRegionService.execute(req, false);
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

    public async activate(
        req: Request,
        res: Response,
    ): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await activateRegionService.execute(
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

    public async deactivate(
        req: Request,
        res: Response,
    ): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await deactivateRegionService.execute(
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

export default new regionController();
