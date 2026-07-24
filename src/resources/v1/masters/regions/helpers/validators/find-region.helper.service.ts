import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import RegionModel from "@/database/regions/regions-db-model";
import { IRegion } from "@/database/regions/regions-db-interface";
import { throwError } from "../../regions.helper";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";

export type IFindRegion = StrictFilterQuery<IRegion & { _id: Types.ObjectId }>;

class findRegionHelperService {
  private readonly regionRepository: Model<IRegion>;

  constructor() {
    this.regionRepository = RegionModel;
  }

  public async execute(
    query: IFindRegion,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
      populate?: any;
    } = {},
  ): Promise<HydratedDocument<IRegion>[]> {
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
      let dbQuery: any = this.regionRepository.find(query).session(session || null);

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
          message: "region already exists",
          data: query,
          filler: { 0: documents[0].name },
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "region not found",
          data: query,
        });

        throwError("region_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IRegion>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding region", errorMap);
    }
  }
}

export default new findRegionHelperService();
