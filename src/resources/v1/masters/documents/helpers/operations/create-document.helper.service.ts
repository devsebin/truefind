import IDocument from "@/database/documents/documents-db-interface";
import DocumentModel from "@/database/documents/documents-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class createDocumentHelperService {
  private readonly documentRepository: Model<IDocument>;

  constructor() {
    this.documentRepository = DocumentModel;
  }

  public async execute(
    payload: IDocument,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IDocument>> {
    try {
      const newData = await this.documentRepository.create([payload], {
        session,
      });

      DbTransactions.push(
        await createDbTransaction(
          tableName.Documents,
          apiMethods.POST,
          operationTypes.Create,
          newData,
        ),
      );
      return newData[0];
    } catch (error) {
      rethrowIfKnown(error, "Error while creating document", errorMap);
    }
  }
}

export default new createDocumentHelperService();
