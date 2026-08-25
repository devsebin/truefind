import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { IServiceDocumentConfiguration } from "@/database/service-document-configuration/service-document-configuration-db-interface";
import ServiceDocumentConfigurationModel from "@/database/service-document-configuration/service-document-configuration-db-model";
import { throwServiceDocumentConfigError } from "../../service-document-configurations.helper";

export type IFindServiceDocumentConfig = StrictFilterQuery<
  IServiceDocumentConfiguration & { _id: Types.ObjectId }
>;

class FindServiceDocumentConfigurationHelperService {
  private readonly repository: Model<IServiceDocumentConfiguration>;

  constructor() {
    this.repository = ServiceDocumentConfigurationModel;
  }

  public async execute(
    query: IFindServiceDocumentConfig,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IServiceDocumentConfiguration>[]> {
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
          message: "Service document configuration already exists for this service",
          data: query,
        });

        throwServiceDocumentConfigError("config_already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Service document configuration not found",
          data: query,
        });

        throwServiceDocumentConfigError("config_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IServiceDocumentConfiguration>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding service document configuration", errorMap);
    }
  }
}

export default new FindServiceDocumentConfigurationHelperService();
