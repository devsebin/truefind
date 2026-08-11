import {
  errorMessages,
  statusCodes,
} from "@/utils/definitions/constants/common";
import { errorResponse } from "@/utils/responses/error.response";
import { JsonResponse } from "@/utils/responses/types";
import { Request, Response } from "express";
import createAuthSessionService from "./services/create-auth-session.service";
import listAuthSessionService from "./services/list-auth-session.service";
import { buildPopulateQuery } from "./auth-sessions.helper";
import createActivityLogService from "../activity-log/services/create-activity-log.service";

class authSessionsController {
  async Store(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await createAuthSessionService.execute(req);
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
      res.status(500).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }

  async Index(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      const query = buildPopulateQuery(req.query);
      Object.defineProperty(req, "query", {
        value: query,
        writable: true,
        configurable: true,
        enumerable: true,
      });

      response = await listAuthSessionService.execute(req);
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
      res.status(500).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }
}

export default new authSessionsController();
