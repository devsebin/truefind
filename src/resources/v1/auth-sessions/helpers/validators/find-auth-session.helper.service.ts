import mongoose, { HydratedDocument, Model, Types } from "mongoose";

import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";

import RefreshSessionModel from "@/database/auth-sessions/auth-session-db-model";
import { IAuthSession } from "@/database/auth-sessions/auth-session-db-interface";

import { throwError } from "../../auth-sessions.helper";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";

export type IFindAuthSession = StrictFilterQuery<IAuthSession & { _id: Types.ObjectId }>;

class findAuthSessionHelperService {
  private readonly authSessionRepository: Model<IAuthSession>;

  constructor() {
    this.authSessionRepository = RefreshSessionModel;
  }

  public async execute(
    query: IFindAuthSession,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IAuthSession>[]> {
    const {
      throwIfExists = false,
      throwIfNotFound = false,
      returnDocument = true,
      lean = false,
      select,
      session,
    } = options;

    try {
      let dbQuery: any = this.authSessionRepository.find(query).session(session || null);

      if (select) {
        dbQuery = dbQuery.select(select);
      }

      if (lean) {
        dbQuery = dbQuery.lean();
      }

      const documents = await dbQuery;

      if (throwIfExists && documents.length > 0) {
        const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
          message: "Session already exists",
          data: query,
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Session not found",
          data: query,
        });

        throwError("session_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IAuthSession>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding session", errorMap);
    }
  }
}

export default new findAuthSessionHelperService();
