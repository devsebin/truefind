import {
  errorMessages,
  statusCodes,
} from "@/utils/definitions/constants/common";
import { errorResponse } from "@/utils/responses/error.response";
import { JsonResponse } from "@/utils/responses/types";
import { Request, Response } from "express";
import mongoose from "mongoose";
import createActivityLogService from "../activity-log/services/create-activity-log.service";
import bulkStoreServiceUserConfigurationService from "./services/bulk-store-service-user-configuration.service";
import createSingleServiceUserConfigurationService from "./services/create-single-service-user-configuration.service";
import listServiceUserConfigurationService from "./services/list-service-user-configuration.service";
import showServiceUserConfigurationService from "./services/show-service-user-configuration.service";
import enableServiceUserConfigurationService from "./services/enable-service-user-configuration.service";
import disableServiceUserConfigurationService from "./services/disable-service-user-configuration.service";
import deleteServiceUserConfigurationService from "./services/delete-service-user-configuration.service";

class ServiceUserConfigurationController {
  public async BulkStore(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      const userId = req.user._id.toString();
      response = await bulkStoreServiceUserConfigurationService.execute(
        userId,
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

  public async StoreSingle(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      const userId = req.user._id.toString();
      response =
        await createSingleServiceUserConfigurationService.execute(
          userId,
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

  public async Index(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await listServiceUserConfigurationService.execute(
        req,
        false,
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
      response = await showServiceUserConfigurationService.execute(
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

  public async activate(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      const userId = req.user?._id
        ? new mongoose.Types.ObjectId(req.user._id.toString())
        : undefined;
      response = await enableServiceUserConfigurationService.execute(
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

  public async deactivate(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      const userId = req.user?._id
        ? new mongoose.Types.ObjectId(req.user._id.toString())
        : undefined;
      response = await disableServiceUserConfigurationService.execute(
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

  public async Delete(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      const is_force = String(req.query.force_action) === "true";
      const userId = req.user?._id
        ? new mongoose.Types.ObjectId(req.user._id.toString())
        : undefined;
      response = await deleteServiceUserConfigurationService.execute(
        new mongoose.Types.ObjectId(req.params.id as string),
        userId,
        is_force,
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

export default new ServiceUserConfigurationController();
