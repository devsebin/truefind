import { ICurrency } from "@/database/currencies/currencies-db-interface";
import { CurrencyModel } from "@/database/currencies/currencies-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { ICurrencyDTO } from "../../dto/create-currencies.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class CreateCurrencyHelperService {
  private readonly repository: Model<ICurrency>;

  constructor() {
    this.repository = CurrencyModel;
  }

  public async execute(
    payload: Partial<ICurrencyDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<ICurrency>> {
    try {
      const doc = new this.repository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.Currencies,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new currency", errorMap);
    }
  }
}

export default new CreateCurrencyHelperService();
