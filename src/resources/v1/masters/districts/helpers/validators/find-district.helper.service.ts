import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import DistrictModel from "@/database/districts/districts-db-model";
import IDistrict from "@/database/districts/districts-db-interface";
import { throwError } from "../../districts.helper";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";

export type IFindDistrict = StrictFilterQuery<IDistrict & { _id: Types.ObjectId }>;

class findDistrictHelperService {
  private readonly districtRepository: Model<IDistrict>;

  constructor() {
    this.districtRepository = DistrictModel;
  }

  public async execute(
    query: IFindDistrict,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
      populate?: any;
    } = {},
  ): Promise<HydratedDocument<IDistrict>[]> {
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
      let dbQuery: any = this.districtRepository.find(query).session(session || null);

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
          message: "district already exists",
          data: query,
          filler: { 0: documents[0].name },
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "district not found",
          data: query,
        });

        throwError("district_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IDistrict>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding district", errorMap);
    }
  }
}

export default new findDistrictHelperService();
