import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import IStatus from "@/database/priorities/priorities-db-interface";
import PrioritiesModel from "@/database/priorities/priorities-db-model";
import { throwError } from "../../priorities.helper";

export type IFindPriorities = StrictFilterQuery<
  IStatus & { _id: Types.ObjectId }
>;

class findPrioritiesHelperService {
  private readonly prioritiesRepository: Model<IStatus>;

  constructor() {
    this.prioritiesRepository = PrioritiesModel;
  }

  public async execute(
    query: IFindPriorities,
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
      populate,
      session,
    } = options;

    try {
      let dbQuery: any = this.prioritiesRepository.find(query).session(session || null);

      if (select) {
        dbQuery = dbQuery.select(select);
      }

      if (lean) {
        dbQuery = dbQuery.lean();
      }

      if (populate) {
        dbQuery = dbQuery.populate(populate);
      }

      const documents = await dbQuery;

      if (throwIfExists && documents.length > 0) {
        const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
          message: "priority already exists",
          data: query,
          filler: { 0: documents[0].title },
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "priority not found",
          data: query,
        });

        throwError("priorities_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IStatus>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding priority", errorMap);
    }
  }
}

export default new findPrioritiesHelperService();
