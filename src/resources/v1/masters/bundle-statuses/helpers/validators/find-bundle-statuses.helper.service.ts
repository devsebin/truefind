import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { IBundleStatus } from "@/database/bundle-statuses/bundle-statuses-db-interface";
import BundleStatusesModel from "@/database/bundle-statuses/bundle-statuses-db-model";
import { throwError } from "../../bundle-statuses.helper";

export type IFindBundleStatuses = StrictFilterQuery<
  IBundleStatus & { _id: Types.ObjectId }
>;

class findBundleStatusesHelperService {
  private readonly bundleStatusRepository: Model<IBundleStatus>;

  constructor() {
    this.bundleStatusRepository = BundleStatusesModel;
  }

  public async execute(
    query: IFindBundleStatuses,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IBundleStatus>[]> {
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
      let dbQuery: any = this.bundleStatusRepository
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
          message: "bundle status already exists",
          data: query,
          filler: { 0: documents[0].title },
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "bundle status not found",
          data: query,
        });

        throwError("bundle_statuses_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IBundleStatus>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding bundle status", errorMap);
    }
  }
}

export default new findBundleStatusesHelperService();
