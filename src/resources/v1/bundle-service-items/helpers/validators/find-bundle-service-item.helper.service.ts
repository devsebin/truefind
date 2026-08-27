import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { IBundleServiceItem } from "@/database/bundle-service-items/bundle-service-items-db-interface";
import BundleServiceItemModel from "@/database/bundle-service-items/bundle-service-items-db-model";
import { throwBundleServiceItemError } from "../../bundle-service-items.helper";

export type IFindBundleServiceItem = StrictFilterQuery<
  IBundleServiceItem & { _id: Types.ObjectId }
>;

class FindBundleServiceItemHelperService {
  private readonly repository: Model<IBundleServiceItem>;

  constructor() {
    this.repository = BundleServiceItemModel;
  }

  public async execute(
    query: IFindBundleServiceItem,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IBundleServiceItem>[]> {
    const {
      throwIfExists = false,
      throwIfNotFound = false,
      returnDocument = true,
      lean = false,
      select,
      populate,
      session,
      sort,
    } = options;

    try {
      let dbQuery: any = this.repository.find(query).session(session || null);

      if (select) {
        dbQuery = dbQuery.select(select);
      }

      if (sort) {
        dbQuery = dbQuery.sort(sort);
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
          message: "Service item already exists for this bundle",
          data: query,
        });

        throwBundleServiceItemError(
          "bundle_service_item_already_exists",
          response,
        );
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Bundle service item not found",
          data: query,
        });

        throwBundleServiceItemError("bundle_service_item_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IBundleServiceItem>[];
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while finding bundle service item",
        errorMap,
      );
    }
  }
}

export default new FindBundleServiceItemHelperService();
