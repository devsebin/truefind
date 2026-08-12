import {
    errorMessages,
    statusCodes,
} from "@/utils/definitions/constants/common";
import { errorResponse } from "@/utils/responses/error.response";
import { JsonResponse } from "@/utils/responses/types";
import { Request, Response } from "express";
import mongoose from "mongoose";
import createActivityLogService from "../../activity-log/services/create-activity-log.service";
import createUnitsService from "./services/create-units.service";
import listUnitsService from "./services/list-units.service";
import showUnitsService from "./services/show-units.service";
import updateUnitsService from "./services/update-units.service";
import deleteUnitsService from "./services/delete-units.service";
import enableUnitsService from "./services/enable-units.service";
import disableUnitsService from "./services/disable-units.service";

class unitsController {
    async Index(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await listUnitsService.execute(req, false);
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
            response = await createUnitsService.execute(req);
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
            response = await showUnitsService.execute(new mongoose.Types.ObjectId(req.params.id as string));
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
            response = await updateUnitsService.execute(
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
            response = await deleteUnitsService.execute(
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
            response = await enableUnitsService.execute(
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
            response = await disableUnitsService.execute(
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

export default new unitsController();
