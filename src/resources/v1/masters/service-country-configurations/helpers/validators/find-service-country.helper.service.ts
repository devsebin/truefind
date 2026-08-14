import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { IServiceCountryConfigurationDocument } from "@/database/service-country-configuration/service-country-configuration.interface";
import ServiceCountryConfigurationModel from "@/database/service-country-configuration/service-country-configuration.model";
import { throwCountryConfigError } from "../../service-country-configurations.helper";

export type IFindServiceCountry = StrictFilterQuery<
  IServiceCountryConfigurationDocument & { _id: Types.ObjectId }
>;

class FindServiceCountryHelperService {
  private readonly repository: Model<IServiceCountryConfigurationDocument>;

  constructor() {
    this.repository = ServiceCountryConfigurationModel;
  }

  public async execute(
    query: IFindServiceCountry,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IServiceCountryConfigurationDocument>[]> {
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
      let dbQuery: any = this.repository.find(query).session(session || null);

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
          message: "Country configuration already exists for this service and country",
          data: query,
        });

        throwCountryConfigError("country_config_already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Country configuration not found",
          data: query,
        });

        throwCountryConfigError("something_went_wrong", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IServiceCountryConfigurationDocument>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding country configuration", errorMap);
    }
  }
}

export default new FindServiceCountryHelperService();
