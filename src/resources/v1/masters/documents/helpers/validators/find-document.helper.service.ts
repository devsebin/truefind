import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import IDocument from "@/database/documents/documents-db-interface";
import DocumentModel from "@/database/documents/documents-db-model";
import { throwError } from "../../documents.helper";

export type IFindDocument = StrictFilterQuery<
  IDocument & { _id: Types.ObjectId }
>;

class findDocumentHelperService {
  private readonly documentRepository: Model<IDocument>;

  constructor() {
    this.documentRepository = DocumentModel;
  }

  public async execute(
    query: IFindDocument,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IDocument>[]> {
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
      let dbQuery: any = this.documentRepository.find(query).session(session || null);

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
          message: "document already exists",
          data: query,
        });

        throwError("SomethingWentWrong", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "document not found",
          data: query,
        });

        throwError("file_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IDocument>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding document", errorMap);
    }
  }
}

export default new findDocumentHelperService();
