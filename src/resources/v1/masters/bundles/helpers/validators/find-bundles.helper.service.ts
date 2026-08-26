import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { IBundleDocument } from "@/database/bundles/bundles-db-interface";
import BundleModel from "@/database/bundles/bundles-db-model";
import { throwError } from "../../bundles.helper";

export type IFindBundles = StrictFilterQuery<
  IBundleDocument & { _id: Types.ObjectId }
>;

class findBundlesHelperService {
  private readonly bundleRepository: Model<IBundleDocument>;

  constructor() {
    this.bundleRepository = BundleModel;
  }

  public async execute(
    query: IFindBundles,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IBundleDocument>[]> {
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
      let dbQuery: any = this.bundleRepository
        .find(query)
        .session(session || null);

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
          message: "bundle already exists",
          data: query,
          filler: { 0: documents[0].name },
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "bundle not found",
          data: query,
        });

        throwError("bundle_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IBundleDocument>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding bundle", errorMap);
    }
  }
}

export default new findBundlesHelperService();
