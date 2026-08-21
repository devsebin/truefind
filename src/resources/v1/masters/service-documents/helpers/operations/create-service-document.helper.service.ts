import { IServiceDocumentRequirements } from "@/database/service-documents/service-documents-db-interface";
import serviceDocumentRequirementModel from "@/database/service-documents/service-documents-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IServiceDocumentDTO } from "../../dto/service-document.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class createServiceDocumentHelperService {
  private readonly repository: Model<IServiceDocumentRequirements>;

  constructor() {
    this.repository = serviceDocumentRequirementModel;
  }

  public async execute(
    payload: Partial<IServiceDocumentDTO> & { created_by?: mongoose.Types.ObjectId },
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceDocumentRequirements>> {
    try {
      const doc = new this.repository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.ServiceDocuments,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating service document", errorMap);
    }
  }
}

export default new createServiceDocumentHelperService();
