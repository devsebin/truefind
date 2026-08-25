import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { IServiceStatus } from "@/database/service-status/service-status-db-interface";
import ServiceStatusModel from "@/database/service-status/service-status-db-model";
import { throwError } from "../../service-statuses.helper";

export type IFindServiceStatuses = StrictFilterQuery<
  IServiceStatus & { _id: Types.ObjectId }
>;

class findServiceStatusesHelperService {
  private readonly serviceStatusRepository: Model<IServiceStatus>;

  constructor() {
    this.serviceStatusRepository = ServiceStatusModel;
  }

  public async execute(
    query: IFindServiceStatuses,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IServiceStatus>[]> {
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
      let dbQuery: any = this.serviceStatusRepository
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
          message: "service status already exists",
          data: query,
          filler: { 0: documents[0].title },
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "service status not found",
          data: query,
        });

        throwError("service_statuses_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IServiceStatus>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding service status", errorMap);
    }
  }
}

export default new findServiceStatusesHelperService();
