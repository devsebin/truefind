import { IProvider } from "@/database/providers/providers-db-interface";
import { ProviderModel } from "@/database/providers/providers-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IProviderDTO } from "../../dto/create-provider.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class createProviderHelperService {
  private readonly providerRepository: Model<IProvider>;

  constructor() {
    this.providerRepository = ProviderModel;
  }

  public async execute(
    payload: Partial<IProviderDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IProvider>> {
    try {
      const doc = new this.providerRepository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.Providers,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new provider", errorMap);
    }
  }
}

export default new createProviderHelperService();
