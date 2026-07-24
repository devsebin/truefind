import mongoose, { HydratedDocument, Model, Types } from "mongoose";

import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";

import StatusModel from "@/database/status/status-db-model";
import { IStatus } from "@/database/status/status-db-interface";

import { throwError } from "../../statuses.helper";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";

export type IFindStatus = StrictFilterQuery<IStatus & { _id: Types.ObjectId }>;

class findStatusHelperService {
  private readonly statusRepository: Model<IStatus>;

  constructor() {
    this.statusRepository = StatusModel;
  }

  public async execute(
    query: IFindStatus,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IStatus>[]> {
    const {
      throwIfExists = false,
      throwIfNotFound = false,
      returnDocument = true,
      lean = false,
      select,
      session,
    } = options;

    try {
      let dbQuery: any = this.statusRepository.find(query).session(session || null);

      if (select) {
        dbQuery = dbQuery.select(select);
      }

      if (lean) {
        dbQuery = dbQuery.lean();
      }

      const documents = await dbQuery;

      if (throwIfExists && documents.length > 0) {
        const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
          message: "status already exists",
          data: query,
          filler: { 0: documents[0].label },
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "status not found",
          data: query,
        });

        throwError("status_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IStatus>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding status", errorMap);
    }
  }
}

export default new findStatusHelperService();
