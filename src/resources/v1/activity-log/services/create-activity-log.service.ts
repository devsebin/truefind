import { generateToken } from "@/utils/helpers/otp-helper";
import { SingleResponse } from "@/utils/responses/success.response";
import { Model } from "mongoose";
import { Request, Response } from "express";
import { UAParser } from "ua-parser-js";
import { convertParamsToId } from "@/middlewares/authorization-api.middleware";
import { buildErrorResult } from "@/utils/responses/error.response";
import {
    IActivityLog,
    IAdditionalInfo,
    IBasicInfo,
    IExecutedBy,
} from "@/database/activity-logs/activity-logs-db-interface";
import { IApi } from "@/database/apis/apis-db-interface";
import ActivityLogModel from "@/database/activity-logs/activity-logs-db-model";
import { api } from "@/database/apis/apis-db-model";

class createActivityLogService {
    private activityLogModel: Model<IActivityLog>;
    private apiModel: Model<IApi>;

    constructor() {
        this.activityLogModel = ActivityLogModel;
        this.apiModel = api;
    }

    // 🔹 Helper: Parse user agent safely
    private parseUserAgent(userAgentString: string) {
        const parser = new UAParser(userAgentString);
        const result = parser.getResult();

        const deviceType = result.device.type || "desktop";

        return {
            device: deviceType === "mobile" ? "Mobile" : "Web",
            os: result.os.name
                ? `${result.os.name} ${result.os.version || ""}`.trim()
                : "",
            browser: result.browser.name
                ? `${result.browser.name} ${result.browser.version || ""}`.trim()
                : "",
        };
    }

    public async execute(
        req: Request,
        res: Response,
        start: number,
        end: number,
        response: SingleResponse,
    ) {
        try {
            const now = new Date();
            const duration = end - start;

            const geo = req.geoData || {};
            const userAgentString = (req.headers["user-agent"] as string) || "";

            const { device, os, browser } = this.parseUserAgent(userAgentString);
            // 🔹 Basic Info
            const basicInfo: IBasicInfo = {
                requestId: generateToken(10),
                requestTime: new Date(start),
                requestDuration: duration,
                requestSize: req.get("Content-Length") ?? "null",
                responseSize: res.get("Content-Length") ?? "null",
                responseDuration: duration,
                responseTime: now,
                responseCode: res.statusCode,
                responseMessage: res.statusMessage || "OK",
            };

            const additionalInfo: IAdditionalInfo = {
                basic_info: basicInfo,
            };

            // 🔹 Executed By
            const executedBy: IExecutedBy = {
                user_id: req.user?.id || "anonymous",
                first_name: req.user?.first_name || "",
                last_name: req.user?.last_name || "",
                user_email: req.user?.email || "anonymous@trufindo.com",
                user_role: req.user?.role || "anonymous",

                user_timezone: req.geoData?.timezone ?? "UTC",
                user_ip: req.geoData?.query ?? req.ip ?? "::1",

                user_proxy: "",
                user_agent: userAgentString,

                user_device: device ? device : "desktop",
                user_os: os ? os : "unknown",
                user_browser: browser ? browser : "unknown",

                user_location: req.geoData?.city ?? "unknown",
                user_country: req.geoData?.country ?? "unknown",
                user_region_code: req.geoData?.region ?? "",
                user_region: req.geoData?.regionName ?? "",
                user_city: req.geoData?.city ?? "",
                user_country_code: req.geoData?.countryCode ?? "",
                user_latitude: req.geoData?.lat ?? 0,
                user_longitude: req.geoData?.lon ?? 0,
                user_postal_code: req.geoData?.zip ?? "",
                user_isp: req.geoData?.isp ?? "",
                user_org: req.geoData?.org ?? "",
                user_as: req.geoData?.as ?? "",

                user_time: now,
            };

            // 🔹 Find API config
            const apiData = await this.apiModel.findOne({
                url: convertParamsToId(req.originalUrl.split("?")[0]),
                activity_method: req.method.toLowerCase(),
                status: true,
            });

            if (!apiData) {
                console.warn(`Activity Log Warning: API endpoint not found in configuration database: [${req.method}] ${req.originalUrl}`);
                return buildErrorResult("API not found in the database.");
            }

            // 🔹 Activity Log Object
            const activityLog: IActivityLog = {
                event_type: apiData.activity_type,
                module_name: apiData.module,
                api_endpoint: apiData.url,
                http_method: apiData.activity_method,

                user_id: req.user?.id || "anonymous",
                timestamp: now,

                client_ip: req.geoData?.query ?? req.ip ?? "::1",
                client_proxy: "",
                client_user_agent: userAgentString,

                response_status: res.statusCode,
                response_time: new Date(end).toISOString(),
                duration_ms: duration,
                response_size: res.get("Content-Length") ?? "null",

                error_details: response?.result?.success ?? null,

                request_headers: { ...req.headers },
                request_params: { ...req.params } as Record<string, string>,
                request_body: req.body || {},

                response_body: response?.result || {},

                executed_by: executedBy,
                db_transactions: response?.DbTransaction || (response as any)?.DbTransactions || [],

                additional_info: additionalInfo,
            };

            return await this.activityLogModel.create(activityLog);
        } catch (error) {
            console.error("Activity Log creation failed:", error);
            return buildErrorResult((error as Error).message);
        }
    }
}

export default new createActivityLogService();
