import { IAuthSession } from "@/database/auth-sessions/auth-session-db-interface";
import { IUser } from "@/database/users/users-db-interface";
import User from "@/database/users/users-db-model";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
  rethrowIfKnown,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import { Request } from "express";
import mongoose, { HydratedDocument, Model } from "mongoose";
import {
  returnAuthSessionSuccess,
  throwError,
  populateFields,
} from "../auth-sessions.helper";
import { authSessionResponse } from "../auth-sessions.response";
import { authSessionsErrorsMessages } from "../auth-sessions.messages";
import { generateToken } from "@/utils/helpers/otp-helper";
import {
  generateTokens,
  hashToken,
} from "@/utils/helpers/authentication.helper";
import createAuthSessionHelperService from "../helpers/operations/create-auth-session.helper.service";
import { UAParser } from "ua-parser-js";

class createAuthSessionService {
  private readonly userRepository: Model<IUser>;

  constructor() {
    this.userRepository = User;
  }

  public async execute(
    request: Request,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];
    try {
      session.startTransaction();

      const user = await this.getUser(request.user._id, session);
      const token = generateTokens(user);

      const authSessionPayload = await this.createAuthSessionPayload(
        user,
        token,
        request,
      );

      const result = await createAuthSessionHelperService.execute(
        authSessionPayload,
        session,
        dbTransactions,
        authSessionsErrorsMessages,
      );

      await result.populate(populateFields);

      await session.commitTransaction();

      return returnAuthSessionSuccess(
        "session_created",
        authSessionResponse(result),
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        authSessionsErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }

  private async getUser(
    userId: mongoose.Types.ObjectId,
    session: mongoose.ClientSession,
  ): Promise<HydratedDocument<IUser>> {
    try {
      const user = await this.userRepository.findById(userId).session(session);
      if (!user) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "User not found",
          data: { userId },
        });
        return throwError("user_not_found", response);
      }
      return user;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error fetching user",
        authSessionsErrorsMessages,
      );
    }
  }

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

  private async createAuthSessionPayload(
    user: HydratedDocument<IUser>,
    token: any,
    req: Request,
  ): Promise<IAuthSession> {
    try {
      const userAgentString = (req.headers["user-agent"] as string) || "";

      const { device, os, browser } = this.parseUserAgent(userAgentString);

      const payload: IAuthSession = {
        userId: user._id,
        refreshTokenHash: hashToken(token.refreshToken),
        tokenId: token.token_id,
        deviceId: generateToken(10),
        deviceName: device,
        device: {
          userAgent: userAgentString,
          browser: browser,
          os: os,
          deviceType: device === "Mobile" ? "mobile" : "desktop",
        },
        ipAddress: req.geoData?.query ?? "::1",
        location: {
          country: req.geoData?.country ?? "",
          city: req.geoData?.city ?? "",
        },
        isRevoked: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      return payload;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating auth session payload", {});
    }
  }
}

export default new createAuthSessionService();
