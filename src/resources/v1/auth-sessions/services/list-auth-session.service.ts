import mongoose, { Model } from "mongoose";
import { Request } from "express";

import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { IAuthSession } from "@/database/auth-sessions/auth-session-db-interface";
import RefreshSessionModel from "@/database/auth-sessions/auth-session-db-model";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { listResponse } from "@/utils/responses/success.response";
import { buildWhereClause } from "@/utils/helpers/build-query.helper";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { returnAuthSessionSuccess } from "../auth-sessions.helper";
import { authSessionsErrorsMessages } from "../auth-sessions.messages";
import { authSessionListResponse } from "../auth-sessions.response";
import findAuthSessionHelperService from "../helpers/validators/find-auth-session.helper.service";

class listAuthSessionService {
  private readonly authSessionRepository: Model<IAuthSession>;

  constructor() {
    this.authSessionRepository = RefreshSessionModel;
  }

  public async execute(
    request: Request,
    is_export = false,
  ): Promise<listResponse | ErrorResponse> {
    const conditions = request.query;
    const page = parseInt(conditions.page as string, 10) || 1;
    const limit = parseInt(conditions.limit as string, 10) || 10;
    const offset = limit * (page - 1);
    const where = await buildWhereClause(request);
    delete where.is_deleted;
    delete where.is_active;
    const dbTransactions: DbTransaction[] = [];

    try {
      const sortField = (conditions.order_by as string) || "createdAt";
      const sortDirection = conditions.order_direction === "asc" ? 1 : -1;
      const sort: Record<string, 1 | -1> = { [sortField]: sortDirection };

      const [result, totalCount] = await Promise.all([
        findAuthSessionHelperService.execute(
          where,
          authSessionsErrorsMessages,
          {
            lean: true,
            sort,
            limit,
            skip: offset,
            populate: conditions.populate as any,
            select: conditions.fields ? (conditions.fields as string).split(",").map((f) => f.trim()).join(" ") : undefined,
          }
        ),
        this.authSessionRepository.countDocuments(where),
      ]);

      const listRes = authSessionListResponse(result);

      dbTransactions.push(
        await createDbTransaction(
          tableName.RefreshSessions,
          apiMethods.GET,
          operationTypes.Read,
          listRes,
        ),
      );

      const data = {
        current_page: page,
        totalCount,
        rows_per_page: limit,
        last_page: Math.ceil(totalCount / limit),
        from: 1 + offset,
        rows: listRes,
      };

      return returnAuthSessionSuccess(
        "authentication_sessions_listed",
        data,
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };
      return buildErrorResult(
        err.message,
        authSessionsErrorsMessages,
        err.data,
      );
    } finally {
      // no session to end
    }
  }
}

export default new listAuthSessionService();
