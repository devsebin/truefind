import mongoose, { HydratedDocument, Model } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { IAuthSession } from "@/database/auth-sessions/auth-session-db-interface";
import RefreshSessionModel from "@/database/auth-sessions/auth-session-db-model";
import { throwError } from "../../auth-sessions.helper";

export type IFindAuthSession = StrictFilterQuery<
  IAuthSession & { _id: mongoose.Types.ObjectId }
>;

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
      limit?: number;
      skip?: number;
    } = {},
  ): Promise<HydratedDocument<IAuthSession>[]> {
    const {
      throwIfExists = false,
      throwIfNotFound = false,
      returnDocument = true,
      lean = false,
      select,
      populate,
      session,
      sort,
      limit,
      skip,
    } = options;

    try {
      let dbQuery: any = this.authSessionRepository.find(query).session(session || null);

      if (select) {
        dbQuery = dbQuery.select(select);
      }

      if (lean) {
        dbQuery = dbQuery.lean();
      }

      if (populate) {
        dbQuery = dbQuery.populate(populate);
      }

      if (sort) {
        dbQuery = dbQuery.sort(sort);
      }

      if (limit) {
        dbQuery = dbQuery.limit(limit);
      }

      if (skip) {
        dbQuery = dbQuery.skip(skip);
      }

      const documents = await dbQuery;

      if (throwIfExists && documents.length > 0) {
        const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
          message: "session already exists",
          data: query,
        });
        return throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "session not found",
          data: query,
        });
        return throwError("session_not_found", response);
      }

      return documents;
    } catch (error) {
      rethrowIfKnown(error, "Error while finding session", errorMap);
    }
  }
}

export default new findAuthSessionHelperService();
