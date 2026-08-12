import IUnits from "@/database/units/units-db-interface";
import UnitsModel from "@/database/units/units-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IUnitsDTO } from "../../dto/create-units.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class createUnitsHelperService {
  private readonly unitsRepository: Model<IUnits>;

  constructor() {
    this.unitsRepository = UnitsModel;
  }

  public async execute(
    payload: Partial<IUnitsDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IUnits>> {
    try {
      const doc = new this.unitsRepository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.Units,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new unit", errorMap);
    }
  }
}

export default new createUnitsHelperService();
