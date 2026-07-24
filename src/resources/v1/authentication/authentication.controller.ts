import { errorMessages, statusCodes } from "@/utils/definitions/constants/common";
import { errorResponse } from "@/utils/responses/error.response";
import { JsonResponse } from "@/utils/responses/types";
import { Request, Response } from "express";
import createActivityLogService from "../activity-log/services/create-activity-log.service";
import LoginAdminService from "./services/admin-login.service";

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
}

export default new authenticationController();
