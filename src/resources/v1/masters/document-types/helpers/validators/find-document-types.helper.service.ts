import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import IDocumentType from "@/database/document-types/document-types-db-interface";
import DocumentTypesModel from "@/database/document-types/document-types-db-model";
import { throwError } from "../../document-types.helper";

export type IFindDocumentTypes = StrictFilterQuery<
  IDocumentType & { _id: Types.ObjectId }
>;

class findDocumentTypesHelperService {
  private readonly documentTypesRepository: Model<IDocumentType>;

  constructor() {
    this.documentTypesRepository = DocumentTypesModel;
  }

  public async execute(
    query: IFindDocumentTypes,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IDocumentType>[]> {
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
      let dbQuery: any = this.documentTypesRepository.find(query).session(session || null);

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
          message: "document type already exists",
          data: query,
          filler: { 0: documents[0].title },
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "document type not found",
          data: query,
        });

        throwError("document_types_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IDocumentType>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding document type", errorMap);
    }
  }
}

export default new findDocumentTypesHelperService();
