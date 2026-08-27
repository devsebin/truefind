import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  errorMessages,
  statusCodes,
} from "@/utils/definitions/constants/common";
import { errorResponse } from "@/utils/responses/error.response";
import { JsonResponse } from "@/utils/responses/types";

import createBundleServiceItemService from "./services/create-bundle-service-item.service";
import listBundleServiceItemService from "./services/list-bundle-service-item.service";
import showBundleServiceItemService from "./services/show-bundle-service-item.service";
import updateBundleServiceItemService from "./services/update-bundle-service-item.service";
import deleteBundleServiceItemService from "./services/delete-bundle-service-item.service";
import toggleStatusBundleServiceItemService from "./services/toggle-status-bundle-service-item.service";
import createActivityLogService from "../activity-log/services/create-activity-log.service";

class BundleServiceItemsController {
  async StoreBundleServiceItem(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await createBundleServiceItemService.execute(req);
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

  async ListBundleServiceItem(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await listBundleServiceItemService.execute(req);
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

  async ShowBundleServiceItem(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await showBundleServiceItemService.execute(
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

  async UpdateBundleServiceItem(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await updateBundleServiceItemService.execute(
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

  async DeleteBundleServiceItem(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await deleteBundleServiceItemService.execute(
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

  async ToggleStatusBundleServiceItem(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await toggleStatusBundleServiceItemService.execute(
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
}

export default new BundleServiceItemsController();
