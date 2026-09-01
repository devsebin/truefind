import { Request, Response } from "express";
import { errorResponse } from "@/utils/responses/error.response";
import { errorMessages, statusCodes } from "@/utils/definitions/constants/common";
import { JsonResponse } from "@/utils/responses/types";
import createActivityLogService from "@/resources/v1/activity-log/services/create-activity-log.service";
import listConditionsService from "./services/list-conditions.service";
import createPolicyService from "./services/create-policy.service";
import updatePolicyService from "./services/update-policy.service";
import getPolicyService from "./services/get-policy.service";
import validatePolicyService from "./services/validate-policy.service";
import publishPolicyService from "./services/publish-policy.service";
import rollbackPolicyService from "./services/rollback-policy.service";
import getAuditsService from "./services/get-audits.service";
import evaluateEntityService from "./services/evaluate-entity.service";

class EnablementAdminController {
  public async listConditions(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await listConditionsService.execute(req);
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      const message = error.message;
      const status = error.statusCode || error.status || statusCodes.InternalServerError;
      response = {
        result: errorResponse(errorMessages.SomethingWentWrong, status, [message]),
        DbTransactions: [],
      };
      return res.status(status).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }

  public async getPolicies(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await getPolicyService.getByEntityType(req);
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      const message = error.message;
      response = {
        result: errorResponse(errorMessages.SomethingWentWrong, error.status || statusCodes.InternalServerError, [message]),
        DbTransactions: [],
      };
      return res.status(error.status || statusCodes.InternalServerError).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }

  public async getPolicyById(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await getPolicyService.getById(req.params.id as string);
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      const message = error.message;
      response = {
        result: errorResponse(errorMessages.SomethingWentWrong, error.status || statusCodes.InternalServerError, [message]),
        DbTransactions: [],
      };
      return res.status(error.status || statusCodes.InternalServerError).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }

  public async createPolicy(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await createPolicyService.execute(req);
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      const message = error.message;
      response = {
        result: errorResponse(errorMessages.SomethingWentWrong, error.status || statusCodes.InternalServerError, [message]),
        DbTransactions: [],
      };
      return res.status(error.status || statusCodes.InternalServerError).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }

  public async updatePolicy(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await updatePolicyService.execute(req.params.id as string, req);
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      const message = error.message;
      const status = error.statusCode || error.status || statusCodes.InternalServerError;
      response = {
        result: errorResponse(errorMessages.SomethingWentWrong, status, [message]),
        DbTransactions: [],
      };
      return res.status(status).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }

  public async validatePolicy(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await validatePolicyService.execute(req.params.id as string, req);
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      const message = error.message;
      response = {
        result: errorResponse(errorMessages.SomethingWentWrong, error.status || statusCodes.InternalServerError, [message]),
        DbTransactions: [],
      };
      return res.status(error.status || statusCodes.InternalServerError).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }

  public async publishPolicy(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await publishPolicyService.execute(req.params.id as string, req);
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      const message = error.message;
      response = {
        result: errorResponse(errorMessages.SomethingWentWrong, error.status || statusCodes.InternalServerError, [message]),
        DbTransactions: [],
      };
      return res.status(error.status || statusCodes.InternalServerError).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }

  public async rollbackPolicy(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await rollbackPolicyService.execute(req.params.id as string, req);
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      const message = error.message;
      response = {
        result: errorResponse(errorMessages.SomethingWentWrong, error.status || statusCodes.InternalServerError, [message]),
        DbTransactions: [],
      };
      return res.status(error.status || statusCodes.InternalServerError).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }

  public async getAudits(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await getAuditsService.execute(req);
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      const message = error.message;
      response = {
        result: errorResponse(errorMessages.SomethingWentWrong, error.status || statusCodes.InternalServerError, [message]),
        DbTransactions: [],
      };
      return res.status(error.status || statusCodes.InternalServerError).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }

  public async evaluateEntity(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = new Date().getTime();
    try {
      response = await evaluateEntityService.execute(req);
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      const message = error.message;
      response = {
        result: errorResponse(errorMessages.SomethingWentWrong, error.status || statusCodes.InternalServerError, [message]),
        DbTransactions: [],
      };
      return res.status(error.status || statusCodes.InternalServerError).json(response.result);
    } finally {
      const end = new Date().getTime();
      createActivityLogService.execute(req, res, start, end, response);
    }
  }
}

export default new EnablementAdminController();
