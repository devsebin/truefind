import { errorMessages, statusCodes } from "@/utils/definitions/constants/common";
import { errorResponse } from "@/utils/responses/error.response";
import { JsonResponse } from "@/utils/responses/types";
import { Request, Response } from "express";
import createActivityLogService from "../activity-log/services/create-activity-log.service";
import LoginAdminService from "./services/admin-login.service";
import refreshTokenService from "./services/refresh-token.service";
import logoutService from "./services/logout.service";
import logoutAllService from "./services/logout-all.service";
import sentOtpService from "./services/sent-otp.service";

class authenticationController {
    async AdminLogin(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await LoginAdminService.execute(req);
            return res.status(response.result.code).json(response.result);
        } catch (error: any) {
            const message = (error as Error).message;
            response = {
                result: errorResponse(errorMessages.SomethingWentWrong, 500, [message]),
                DbTransactions: [],
            };
            return res.status(error.status as number || statusCodes.InternalServerError).json(response.result);
        } finally {
            const end = new Date().getTime();
            createActivityLogService.execute(req, res, start, end, response);
        }
    }

    async RefreshToken(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            const object = req.body.refresh_token;
            response = await refreshTokenService.execute(req, object);
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
            return res.status(error.status as number || statusCodes.InternalServerError).json(response.result);
        } finally {
            const end = new Date().getTime();
            createActivityLogService.execute(req, res, start, end, response);
        }
    }

    async Logout(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await logoutService.execute(req);
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
            return res.status(error.status as number || statusCodes.InternalServerError).json(response.result);
        } finally {
            const end = new Date().getTime();
            createActivityLogService.execute(req, res, start, end, response);
        }
    }

    async LogoutAll(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            response = await logoutAllService.execute(req);
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
            return res.status(error.status as number || statusCodes.InternalServerError).json(response.result);
        } finally {
            const end = new Date().getTime();
            createActivityLogService.execute(req, res, start, end, response);
        }
    }

    async SentOtp(req: Request, res: Response): Promise<JsonResponse | void> {
        let response: any;
        const start = new Date().getTime();
        try {
            const object = { ...req.body };
            response = await sentOtpService.execute(object);
            res.status(response.result.code).json(response.result);
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
            res.status(error.status as number).json(response.result);
        } finally {
            const end = new Date().getTime();
            createActivityLogService.execute(req, res, start, end, response);
        }
    };

}

export default new authenticationController();
