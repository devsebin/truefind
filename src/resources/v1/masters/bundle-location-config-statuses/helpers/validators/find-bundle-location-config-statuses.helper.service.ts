import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { IBundleLocationConfigStatus } from "@/database/bundle-location-config-status/bundle-location-config-status-db-interface";
import BundleLocationConfigStatusesModel from "@/database/bundle-location-config-status/bundle-location-config-status-db-model";
import { throwError } from "../../bundle-location-config-statuses.helper";

export type IFindBundleLocationConfigStatuses = StrictFilterQuery<
  IBundleLocationConfigStatus & { _id: Types.ObjectId }
>;

class findBundleLocationConfigStatusesHelperService {
  private readonly bundleLocationConfigStatusRepository: Model<IBundleLocationConfigStatus>;

  constructor() {
    this.bundleLocationConfigStatusRepository =
      BundleLocationConfigStatusesModel;
  }

  public async execute(
    query: IFindBundleLocationConfigStatuses,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IBundleLocationConfigStatus>[]> {
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
      let dbQuery: any = this.bundleLocationConfigStatusRepository
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
          message: "bundle location config status already exists",
          data: query,
          filler: { 0: documents[0].title },
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "bundle location config status not found",
          data: query,
        });

        throwError("bundle_location_config_statuses_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IBundleLocationConfigStatus>[];
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while finding bundle location config status",
        errorMap,
      );
    }
  }
}

export default new findBundleLocationConfigStatusesHelperService();
