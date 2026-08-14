import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { IServiceAreaConfigurationDocument } from "@/database/service-area-configuration/service-area-configuration.interface";
import ServiceAreaConfigurationModel from "@/database/service-area-configuration/service-area-configuration.model";
import { throwAreaConfigError } from "../../service-area-configurations.helper";

export type IFindServiceArea = StrictFilterQuery<
  IServiceAreaConfigurationDocument & { _id: Types.ObjectId }
>;

class FindServiceAreaHelperService {
  private readonly repository: Model<IServiceAreaConfigurationDocument>;

  constructor() {
    this.repository = ServiceAreaConfigurationModel;
  }

  public async execute(
    query: IFindServiceArea,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
      populate?: any;
    } = {},
  ): Promise<HydratedDocument<IServiceAreaConfigurationDocument>[]> {
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
          message: "Service area configuration already exists for this service and suburb",
          data: query,
        });

        throwAreaConfigError("area_config_already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Service area configuration not found",
          data: query,
        });

        throwAreaConfigError("something_went_wrong", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IServiceAreaConfigurationDocument>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding service area configuration", errorMap);
    }
  }
}

export default new FindServiceAreaHelperService();
