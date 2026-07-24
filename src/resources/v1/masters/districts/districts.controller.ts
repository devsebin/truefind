import { JsonResponse } from "@/utils/responses/types";
import createActivityLogService from "../../activity-log/services/create-activity-log.service";
import { Request, Response } from "express";
import { errorResponse } from "@/utils/responses/error.response";
import {
    errorMessages,
    statusCodes,
} from "@/utils/definitions/constants/common";
import mongoose from "mongoose";
import createDistrictsService from "./services/create-districts.service";
import updateDistrictsService from "./services/update-districts.service";
import deleteDistrictsService from "./services/delete-districts.service";
import showDistrictsService from "./services/show-districts.service";
import listDistrictsService from "./services/list-districts.service";
import enableDistrictsService from "./services/enable-districts.service";
import disableDistrictsService from "./services/disable-districts.service";

class districtsController {
    public async Store(
        req: Request,
        res: Response,
    ): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await createDistrictsService.execute(req);
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
            response = await updateDistrictsService.execute(
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
            response = await deleteDistrictsService.execute(
                new mongoose.Types.ObjectId(req.params.id as string),
                new mongoose.Types.ObjectId(), // Stub user ID as in other masters
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
            response = await showDistrictsService.execute(
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
            response = await listDistrictsService.execute(req, false);
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

    public activate = async (
        req: Request,
        res: Response,
    ): Promise<JsonResponse | void> => {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await enableDistrictsService.execute(
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

    public deactivate = async (
        req: Request,
        res: Response,
    ): Promise<JsonResponse | void> => {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await disableDistrictsService.execute(
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

export default new districtsController();
