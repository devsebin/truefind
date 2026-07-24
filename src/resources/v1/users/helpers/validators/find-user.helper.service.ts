import mongoose, { HydratedDocument, Model, Types } from "mongoose";

import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";

import User from "@/database/users/users-db-model";
import { IUser } from "@/database/users/users-db-interface";

import { throwError } from "../../users.helper";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";

export type IFindUser = StrictFilterQuery<IUser & { _id: Types.ObjectId }>;

class findUserHelperService {
  private readonly userRepository: Model<IUser>;

  constructor() {
    this.userRepository = User;
  }

  public async execute(
    query: IFindUser,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IUser>[]> {
    const {
      throwIfExists = false,
      throwIfNotFound = false,
      returnDocument = true,
      lean = false,
      select,
      session,
    } = options;

    try {
      let dbQuery: any = this.userRepository.find(query).session(session || null);

      if (select) {
        dbQuery = dbQuery.select(select);
      }

      if (lean) {
        dbQuery = dbQuery.lean();
      }

      const documents = await dbQuery;

      if (throwIfExists && documents.length > 0) {
        const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
          message: "User already exists",
          data: query,
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "User not found",
          data: query,
        });

        throwError("user_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IUser>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding user", errorMap);
    }
  }
}

export default new findUserHelperService();
