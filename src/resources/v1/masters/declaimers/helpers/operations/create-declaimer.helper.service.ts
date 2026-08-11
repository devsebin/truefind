import { IDeclaimer } from "@/database/declaimers/declaimers-db-interface";
import DeclaimerModel from "@/database/declaimers/declaimers-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IDeclaimerDTO } from "../../dto/declaimer.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class createDeclaimerHelperService {
  private readonly declaimerRepository: Model<IDeclaimer>;

  constructor() {
    this.declaimerRepository = DeclaimerModel;
  }

  public async execute(
    payload: Partial<IDeclaimerDTO> & { version: number; created_by?: string },
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IDeclaimer>> {
    try {
      const doc = new this.declaimerRepository({
        ...payload,
        is_latest: true,
        is_active: true,
        is_deleted: false,
      });
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.Declaimers,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new declaimer", errorMap);
    }
  }
}

export default new createDeclaimerHelperService();
