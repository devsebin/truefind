import {
  errorMessages,
  statusCodes,
} from "@/utils/definitions/constants/common";
import { errorResponse } from "@/utils/responses/error.response";
import { JsonResponse } from "@/utils/responses/types";
import { Request, Response } from "express";
import mongoose from "mongoose";
import createActivityLogService from "../../activity-log/services/create-activity-log.service";
import createBundlesService from "./services/create-bundles.service";
import listBundlesService from "./services/list-bundles.service";
import showBundlesService from "./services/show-bundles.service";
import updateBundlesService from "./services/update-bundles.service";
import deleteBundlesService from "./services/delete-bundles.service";
import enableBundlesService from "./services/enable-bundles.service";
import disableBundlesService from "./services/disable-bundles.service";
import approveBundleService from "./services/approve-bundle.service";

class bundlesController {
  async Index(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await listBundlesService.execute(req, false);
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
      response = await createBundlesService.execute(req);
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
      const id = new mongoose.Types.ObjectId(req.params.id as string);
      response = await showBundlesService.execute(id);
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
      const id = new mongoose.Types.ObjectId(req.params.id as string);
      response = await updateBundlesService.execute(id, req);
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
      const id = new mongoose.Types.ObjectId(req.params.id as string);
      const is_force = req.query.force_action === "true";
      const userId = new mongoose.Types.ObjectId(String(req.user?._id));
      response = await deleteBundlesService.execute(id, userId, is_force);
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
      const id = new mongoose.Types.ObjectId(req.params.id as string);
      const userId = new mongoose.Types.ObjectId(String(req.user?._id));
      response = await enableBundlesService.execute(id, userId);
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
      const id = new mongoose.Types.ObjectId(req.params.id as string);
      const userId = new mongoose.Types.ObjectId(String(req.user?._id));
      response = await disableBundlesService.execute(id, userId);
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

  async Approve(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      const id = new mongoose.Types.ObjectId(req.params.id as string);
      const userId = new mongoose.Types.ObjectId(String(req.user?._id));
      response = await approveBundleService.execute(id, userId);
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

export default new bundlesController();
