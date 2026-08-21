import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { IServiceDocumentRequirements } from "@/database/service-documents/service-documents-db-interface";
import serviceDocumentRequirementModel from "@/database/service-documents/service-documents-db-model";
import { throwError } from "../../service-documents.helper";

export type IFindServiceDocument = StrictFilterQuery<
  IServiceDocumentRequirements & { _id: Types.ObjectId }
>;

class findServiceDocumentHelperService {
  private readonly repository: Model<IServiceDocumentRequirements>;

  constructor() {
    this.repository = serviceDocumentRequirementModel;
  }

  public async execute(
    query: IFindServiceDocument,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IServiceDocumentRequirements>[]> {
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
          message: "service document already exists",
          data: query,
          filler: { 0: documents[0].name || documents[0].item_code },
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "service document not found",
          data: query,
        });

        throwError("service_document_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IServiceDocumentRequirements>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding service document", errorMap);
    }
  }
}

export default new findServiceDocumentHelperService();
