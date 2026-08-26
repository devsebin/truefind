import {
  errorMessages,
  statusCodes,
} from "@/utils/definitions/constants/common";
import { errorResponse } from "@/utils/responses/error.response";
import { JsonResponse } from "@/utils/responses/types";
import { Request, Response } from "express";
import mongoose from "mongoose";
import createActivityLogService from "../../activity-log/services/create-activity-log.service";
import createBundleStatusesService from "./services/create-bundle-statuses.service";
import listBundleStatusesService from "./services/list-bundle-statuses.service";
import showBundleStatusesService from "./services/show-bundle-statuses.service";
import updateBundleStatusesService from "./services/update-bundle-statuses.service";
import deleteBundleStatusesService from "./services/delete-bundle-statuses.service";
import enableBundleStatusesService from "./services/enable-bundle-statuses.service";
import disableBundleStatusesService from "./services/disable-bundle-statuses.service";

class bundleStatusesController {
  async Index(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await listBundleStatusesService.execute(req, false);
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
      response = await createBundleStatusesService.execute(req);
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
      response = await showBundleStatusesService.execute(
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
      response = await updateBundleStatusesService.execute(
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
      response = await deleteBundleStatusesService.execute(
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
      response = await enableBundleStatusesService.execute(
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
      response = await disableBundleStatusesService.execute(
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

export default new bundleStatusesController();
