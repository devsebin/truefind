import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { IServiceUserDocumentConfiguration } from "@/database/service-user-document-configuration/service-user-document-configuration-db-interface";
import ServiceUserDocumentConfigurationsModel from "@/database/service-user-document-configuration/service-user-document-configuration-db-model";
import { throwError } from "../../service-user-document-configuration.helper";

export type IFindServiceUserDocConfig = StrictFilterQuery<
  IServiceUserDocumentConfiguration & { _id: Types.ObjectId }
>;

class FindServiceUserDocumentConfigurationHelperService {
  private readonly repository: Model<IServiceUserDocumentConfiguration>;

  constructor() {
    this.repository = ServiceUserDocumentConfigurationsModel;
  }

  public async execute(
    query: IFindServiceUserDocConfig,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IServiceUserDocumentConfiguration>[]> {
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
          message: "Service user document configuration already exists",
          data: query,
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Service user document configuration not found",
          data: query,
        });

        throwError("configuration_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IServiceUserDocumentConfiguration>[];
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while finding service user document configuration",
        errorMap,
      );
    }
  }

  public async findOne(
    query: any,
    session?: mongoose.ClientSession,
  ): Promise<HydratedDocument<IServiceUserDocumentConfiguration> | null> {
    let dbQuery = this.repository.findOne(query);
    if (session) {
      dbQuery = dbQuery.session(session);
    }
    return await dbQuery;
  }
}

export default new FindServiceUserDocumentConfigurationHelperService();
