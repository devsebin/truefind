import { IBundleServiceItem } from "@/database/bundle-service-items/bundle-service-items-db-interface";
import BundleServiceItemModel from "@/database/bundle-service-items/bundle-service-items-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IBundleServiceItemDTO } from "../../dto/bundle-service-item.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class CreateBundleServiceItemHelperService {
  private readonly repository: Model<IBundleServiceItem>;

  constructor() {
    this.repository = BundleServiceItemModel;
  }

  public async execute(
    payload: Partial<IBundleServiceItemDTO> & {
      created_by?: mongoose.Types.ObjectId;
      updated_by?: mongoose.Types.ObjectId;
    },
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleServiceItem>> {
    try {
      const doc = new this.repository(payload);
      await doc.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.BundleServiceItems,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while creating new bundle service item",
        errorMap,
      );
    }
  }
}

export default new CreateBundleServiceItemHelperService();
