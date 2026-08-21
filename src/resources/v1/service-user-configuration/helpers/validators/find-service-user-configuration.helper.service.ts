import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { IUserTaskMapping } from "@/database/service-user-configuration/service-user-configuration-db-interface";
import TaskUserMappingModel from "@/database/service-user-configuration/service-user-configuration-db-model";
import { throwError } from "../../service-user-configuration.helper";

export type IFindServiceUserConfig = StrictFilterQuery<
  IUserTaskMapping & { _id: Types.ObjectId }
>;

class FindServiceUserConfigurationHelperService {
  private readonly repository: Model<IUserTaskMapping>;

  constructor() {
    this.repository = TaskUserMappingModel;
  }

  public async execute(
    query: IFindServiceUserConfig,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IUserTaskMapping>[]> {
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
          message: "Service user configuration already exists",
          data: query,
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Service user configuration not found",
          data: query,
        });

        throwError("configuration_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IUserTaskMapping>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding service user configuration", errorMap);
    }
  }

  public async findOne(
    query: any,
    session?: mongoose.ClientSession,
  ): Promise<HydratedDocument<IUserTaskMapping> | null> {
    let dbQuery = this.repository.findOne(query);
    if (session) {
      dbQuery = dbQuery.session(session);
    }
    return await dbQuery;
  }
}

export default new FindServiceUserConfigurationHelperService();
