import { IBaseServiceDocument } from "@/database/services/services-db-interface";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { tableName } from "@/utils/definitions/constants/table-names";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { servicesErrorsMessages } from "../../services.messages";

class createServiceEntityHelperService {
  public async execute<T extends IBaseServiceDocument>(
    model: Model<T>,
    payload: any,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
  ): Promise<HydratedDocument<T>> {
    try {
      const doc = new model(payload);
      await doc.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Services,
          apiMethods.POST,
          operationTypes.Create,
          doc,
        ),
      );
      return doc;
    } catch (err: any) {
      rethrowIfKnown(err, "Error creating service entity", servicesErrorsMessages);
    }
  }
}

export default new createServiceEntityHelperService();
