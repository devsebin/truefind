import {
    errorMessages,
    statusCodes,
} from "@/utils/definitions/constants/common";
import { errorResponse } from "@/utils/responses/error.response";
import { JsonResponse } from "@/utils/responses/types";
import { Request, Response } from "express";
import createActivityLogService from "../../activity-log/services/create-activity-log.service";
import createCategoryService from "./services/create-category.service";
import listCategoryService from "./services/list-category.service";
import createSubcategoryService from "./services/create-subcategory.service";
import createServiceService from "./services/create-service.service";
import showServiceEntityService from "./services/show-service-entity.service";
import deleteServiceEntityService from "./services/delete-service-entity.service";
import enableServiceEntityService from "./services/enable-service-entity.service";
import disableServiceEntityService from "./services/disable-service-entity.service";
import updateServiceEntityService from "./services/update-service-entity.service";
import { buildPopulateQuery } from "./services.helper";
import mongoose from "mongoose";

class ServicesController {
    async StoreCategory(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await createCategoryService.execute(req);
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

    async ListCategory(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            const query = buildPopulateQuery(req.query);
            req.query = query;
            response = await listCategoryService.execute(req);
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

    async StoreSubCategory(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await createSubcategoryService.execute(req);
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

    async StoreService(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await createServiceService.execute(req);
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

    async ShowEntity(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await showServiceEntityService.execute(new mongoose.Types.ObjectId(req.params.id as string));
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

    async DeleteEntity(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            const is_force = req.query.force_action ?? false;
            const userId = req.user?._id
                ? new mongoose.Types.ObjectId(req.user._id as string)
                : new mongoose.Types.ObjectId();

            response = await deleteServiceEntityService.execute(
                new mongoose.Types.ObjectId(req.params.id as string),
                userId,
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

    async EnableEntity(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            const userId = req.user?._id
                ? new mongoose.Types.ObjectId(req.user._id as string)
                : new mongoose.Types.ObjectId();

            response = await enableServiceEntityService.execute(
                new mongoose.Types.ObjectId(req.params.id as string),
                userId,
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

    async DisableEntity(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            const userId = req.user?._id
                ? new mongoose.Types.ObjectId(req.user._id as string)
                : new mongoose.Types.ObjectId();

            response = await disableServiceEntityService.execute(
                new mongoose.Types.ObjectId(req.params.id as string),
                userId,
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

    async UpdateEntity(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            const userId = req.user?._id
                ? new mongoose.Types.ObjectId(req.user._id as string)
                : new mongoose.Types.ObjectId();

            response = await updateServiceEntityService.execute(
                new mongoose.Types.ObjectId(req.params.id as string),
                userId,
                req.body,
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

export default new ServicesController();
