import {
  errorMessages,
  statusCodes,
} from "@/utils/definitions/constants/common";
import { errorResponse } from "@/utils/responses/error.response";
import { JsonResponse } from "@/utils/responses/types";
import { Request, Response } from "express";
import mongoose from "mongoose";
import createActivityLogService from "../../activity-log/services/create-activity-log.service";
import createBundleLocationConfigStatusesService from "./services/create-bundle-location-config-statuses.service";
import listBundleLocationConfigStatusesService from "./services/list-bundle-location-config-statuses.service";
import showBundleLocationConfigStatusesService from "./services/show-bundle-location-config-statuses.service";
import updateBundleLocationConfigStatusesService from "./services/update-bundle-location-config-statuses.service";
import deleteBundleLocationConfigStatusesService from "./services/delete-bundle-location-config-statuses.service";
import enableBundleLocationConfigStatusesService from "./services/enable-bundle-location-config-statuses.service";
import disableBundleLocationConfigStatusesService from "./services/disable-bundle-location-config-statuses.service";

class bundleLocationConfigStatusesController {
  async Index(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await listBundleLocationConfigStatusesService.execute(
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

  async Store(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response =
        await createBundleLocationConfigStatusesService.execute(req);
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
      response = await showBundleLocationConfigStatusesService.execute(
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

  async Update(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await updateBundleLocationConfigStatusesService.execute(
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
      response = await deleteBundleLocationConfigStatusesService.execute(
        new mongoose.Types.ObjectId(req.params.id as string),
        req.user._id,
        req.query.force_action === "true",
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
      response = await enableBundleLocationConfigStatusesService.execute(
        new mongoose.Types.ObjectId(req.params.id as string),
        req.user._id,
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
      response = await disableBundleLocationConfigStatusesService.execute(
        new mongoose.Types.ObjectId(req.params.id as string),
        req.user._id,
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

export default new bundleLocationConfigStatusesController();
