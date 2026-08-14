import { Request, Response } from "express";
import mongoose from "mongoose";
import { errorMessages, statusCodes } from "@/utils/definitions/constants/common";
import { errorResponse } from "@/utils/responses/error.response";
import { JsonResponse } from "@/utils/responses/types";
import createActivityLogService from "../../activity-log/services/create-activity-log.service";

import bulkCreateAreaOverrideService from "./services/bulk-create-area-override.service";
import showEffectiveConfigService from "./services/show-effective-config.service";
import listAvailableServicesService from "./services/list-available-services.service";

class ServiceAreaConfigurationsController {
  async BulkCreateAreaOverride(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await bulkCreateAreaOverrideService.execute(
        new mongoose.Types.ObjectId(req.params.serviceId as string),
        req.body.suburb_ids,
        req.body.overrides
      );
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

  async ShowEffectiveConfig(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await showEffectiveConfigService.execute(
        new mongoose.Types.ObjectId(req.params.serviceId as string),
        new mongoose.Types.ObjectId(req.query.suburb_id as string)
      );
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

  async ListAvailableServices(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await listAvailableServicesService.execute(
        new mongoose.Types.ObjectId(req.query.suburb_id as string)
      );
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

export default new ServiceAreaConfigurationsController();
