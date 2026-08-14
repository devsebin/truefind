import { Request, Response } from "express";
import mongoose from "mongoose";
import { errorMessages, statusCodes } from "@/utils/definitions/constants/common";
import { errorResponse } from "@/utils/responses/error.response";
import { JsonResponse } from "@/utils/responses/types";
import createActivityLogService from "../../activity-log/services/create-activity-log.service";

import createCountryConfigurationService from "./services/create-country-configuration.service";
import listCountryConfigurationService from "./services/list-country-configuration.service";
import showCountryConfigurationService from "./services/show-country-configuration.service";
import updateCountryConfigurationService from "./services/update-country-configuration.service";
import deleteCountryConfigurationService from "./services/delete-country-configuration.service";

class ServiceCountryConfigurationsController {
  async StoreCountryConfig(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await createCountryConfigurationService.execute(req);
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      const message = (error as Error).message;
      response = {
        result: errorResponse(errorMessages.SomethingWentWrong, statusCodes.InternalServerError, [message]),
        DbTransactions: [],
      };
      res.status(statusCodes.InternalServerError).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }

  async ListCountryConfig(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await listCountryConfigurationService.execute(req);
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      const message = (error as Error).message;
      response = {
        result: errorResponse(errorMessages.SomethingWentWrong, statusCodes.InternalServerError, [message]),
        DbTransactions: [],
      };
      res.status(statusCodes.InternalServerError).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }

  async ShowCountryConfig(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await showCountryConfigurationService.execute(new mongoose.Types.ObjectId(req.params.id as string));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      const message = (error as Error).message;
      response = {
        result: errorResponse(errorMessages.SomethingWentWrong, statusCodes.InternalServerError, [message]),
        DbTransactions: [],
      };
      res.status(statusCodes.InternalServerError).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }

  async UpdateCountryConfig(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await updateCountryConfigurationService.execute(new mongoose.Types.ObjectId(req.params.id as string), req);
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      const message = (error as Error).message;
      response = {
        result: errorResponse(errorMessages.SomethingWentWrong, statusCodes.InternalServerError, [message]),
        DbTransactions: [],
      };
      res.status(statusCodes.InternalServerError).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }

  async DeleteCountryConfig(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await deleteCountryConfigurationService.execute(new mongoose.Types.ObjectId(req.params.id as string));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      const message = (error as Error).message;
      response = {
        result: errorResponse(errorMessages.SomethingWentWrong, statusCodes.InternalServerError, [message]),
        DbTransactions: [],
      };
      res.status(statusCodes.InternalServerError).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }
}

export default new ServiceCountryConfigurationsController();
