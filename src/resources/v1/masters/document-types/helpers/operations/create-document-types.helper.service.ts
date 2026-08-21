import IDocumentType from "@/database/document-types/document-types-db-interface";
import DocumentTypesModel from "@/database/document-types/document-types-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IDocumentTypesDTO } from "../../dto/create-document-types.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class createDocumentTypesHelperService {
  private readonly documentTypesRepository: Model<IDocumentType>;

  constructor() {
    this.documentTypesRepository = DocumentTypesModel;
  }

  public async execute(
    payload: Partial<IDocumentTypesDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IDocumentType>> {
    try {
      const doc = new this.documentTypesRepository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.DocumentTypes,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new document type", errorMap);
    }
  }
}

export default new createDocumentTypesHelperService();
