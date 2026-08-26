import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { IBundleUserMappingStatus } from "@/database/bundle-user-mapping-status/bundle-user-mapping-status-db-interface";
import BundleUserMappingStatusModel from "@/database/bundle-user-mapping-status/bundle-user-mapping-status-db-model";
import { throwError } from "../../bundle-user-mapping-status.helper";

export type IFindBundleUserMappingStatuses = StrictFilterQuery<
  IBundleUserMappingStatus & { _id: Types.ObjectId }
>;

class findBundleUserMappingStatusHelperService {
  private readonly bundleUserMappingStatusRepository: Model<IBundleUserMappingStatus>;

  constructor() {
    this.bundleUserMappingStatusRepository = BundleUserMappingStatusModel;
  }

  public async execute(
    query: IFindBundleUserMappingStatuses,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IBundleUserMappingStatus>[]> {
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
      let dbQuery: any = this.bundleUserMappingStatusRepository
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
          message: "bundle user mapping status already exists",
          data: query,
          filler: { 0: documents[0].title },
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "bundle user mapping status not found",
          data: query,
        });

        throwError("bundle_user_mapping_status_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IBundleUserMappingStatus>[];
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while finding bundle user mapping status",
        errorMap,
      );
    }
  }
}

export default new findBundleUserMappingStatusHelperService();
