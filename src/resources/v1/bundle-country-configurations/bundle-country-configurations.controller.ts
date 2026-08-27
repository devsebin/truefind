import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  errorMessages,
  statusCodes,
} from "@/utils/definitions/constants/common";
import { errorResponse } from "@/utils/responses/error.response";
import { JsonResponse } from "@/utils/responses/types";

import createBundleCountryConfigurationService from "./services/create-bundle-country-configuration.service";
import listBundleCountryConfigurationService from "./services/list-bundle-country-configuration.service";
import showBundleCountryConfigurationService from "./services/show-bundle-country-configuration.service";
import updateBundleCountryConfigurationService from "./services/update-bundle-country-configuration.service";
import deleteBundleCountryConfigurationService from "./services/delete-bundle-country-configuration.service";
import createActivityLogService from "../activity-log/services/create-activity-log.service";

class BundleCountryConfigurationsController {
  async StoreCountryConfig(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await createBundleCountryConfigurationService.execute(req);
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

  async ListCountryConfig(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await listBundleCountryConfigurationService.execute(req);
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

  async ShowCountryConfig(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await showBundleCountryConfigurationService.execute(
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

  async UpdateCountryConfig(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await updateBundleCountryConfigurationService.execute(
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

  async DeleteCountryConfig(
    req: Request,
    res: Response,
  ): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await deleteBundleCountryConfigurationService.execute(
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
}

export default new BundleCountryConfigurationsController();
