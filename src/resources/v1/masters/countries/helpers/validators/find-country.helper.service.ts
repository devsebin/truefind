import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import ICountry from "@/database/countries/countries-db-interface";
import CountryModel from "@/database/countries/countries-db-model";
import { throwError } from "../../countries.helper";
import { populate } from "dotenv";

export type IFindCountry = StrictFilterQuery<
  ICountry & { _id: Types.ObjectId }
>;

class findCountryHelperService {
  private readonly countryRepository: Model<ICountry>;

  constructor() {
    this.countryRepository = CountryModel;
  }

  public async execute(
    query: IFindCountry,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<ICountry>[]> {
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
      let dbQuery: any = this.countryRepository.find(query).session(session || null);

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
          message: "country already exists",
          data: query,
          filler: { 0: documents[0].name },
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "county not found",
          data: query,
        });

        throwError("country_not_found", response);
      }



      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<ICountry>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding country", errorMap);
    }
  }
}

export default new findCountryHelperService();
