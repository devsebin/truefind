import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { IServiceInformation } from "@/database/service-informations/service-information-db-interface";
import ServiceInformationModel from "@/database/service-informations/service-information-db-model";
import { throwServiceInformationError } from "../../service-informations.helper";

export type IFindServiceInformation = StrictFilterQuery<
  IServiceInformation & { _id: Types.ObjectId }
>;

class FindServiceInformationHelperService {
  private readonly repository: Model<IServiceInformation>;

  constructor() {
    this.repository = ServiceInformationModel;
  }

  public async execute(
    query: IFindServiceInformation,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IServiceInformation>[]> {
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
          message: "Service information already exists for this service",
          data: query,
        });

        throwServiceInformationError("information_already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Service information not found",
          data: query,
        });

        throwServiceInformationError("information_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IServiceInformation>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding service information", errorMap);
    }
  }
}

export default new FindServiceInformationHelperService();
