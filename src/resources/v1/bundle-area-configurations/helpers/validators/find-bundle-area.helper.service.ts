import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { IBundleAreaConfigurationDocument } from "@/database/bundle-area-configuration/bundle-area-configuration-db-interface";
import BundleAreaConfigurationModel from "@/database/bundle-area-configuration/bundle-area-configuration-db-model";
import { throwBundleAreaConfigError } from "../../bundle-area-configurations.helper";

export type IFindBundleArea = StrictFilterQuery<
  IBundleAreaConfigurationDocument & { _id: Types.ObjectId }
>;

class FindBundleAreaHelperService {
  private readonly repository: Model<IBundleAreaConfigurationDocument>;

  constructor() {
    this.repository = BundleAreaConfigurationModel;
  }

  public async execute(
    query: IFindBundleArea,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
      populate?: any;
    } = {},
  ): Promise<HydratedDocument<IBundleAreaConfigurationDocument>[]> {
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
          message:
            "Bundle area configuration already exists for this bundle and suburb",
          data: query,
        });

        throwBundleAreaConfigError("area_config_already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Bundle area configuration not found",
          data: query,
        });

        throwBundleAreaConfigError("area_config_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IBundleAreaConfigurationDocument>[];
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while finding bundle area configuration",
        errorMap,
      );
    }
  }
}

export default new FindBundleAreaHelperService();
