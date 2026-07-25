import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import SuburbModel from "@/database/suburbs/suburbs-db-model";
import ISuburb from "@/database/suburbs/suburbs-db-interface";
import { throwError } from "../../suburbs.helper";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";

export type IFindSuburb = StrictFilterQuery<ISuburb & { _id: Types.ObjectId }>;

class findSuburbHelperService {
  private readonly suburbRepository: Model<ISuburb>;

  constructor() {
    this.suburbRepository = SuburbModel;
  }

  public async execute(
    query: IFindSuburb,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
      populate?: any;
    } = {},
  ): Promise<HydratedDocument<ISuburb>[]> {
    const {
      throwIfExists = false,
      throwIfNotFound = false,
      returnDocument = true,
      lean = false,
      select,
      session,
      populate,
    } = options;

    try {
      let dbQuery: any = this.suburbRepository.find(query).session(session || null);

      if (select) {
        dbQuery = dbQuery.select(select);
      }

      if (populate) {
        dbQuery = dbQuery.populate(populate);
      }

      if (lean) {
        dbQuery = dbQuery.lean();
      }

      const documents = await dbQuery;

      if (throwIfExists && documents.length > 0) {
        const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
          message: "suburb already exists",
          data: query,
          filler: { 0: documents[0].name },
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "suburb not found",
          data: query,
        });

        throwError("suburb_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<ISuburb>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding suburb", errorMap);
    }
  }
}

export default new findSuburbHelperService();
