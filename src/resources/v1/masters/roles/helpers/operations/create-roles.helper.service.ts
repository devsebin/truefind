import IRole from "@/database/roles/roles-db-interface";
import RolesModel from "@/database/roles/roles-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IRolesDTO } from "../../dto/create-roles.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class createRolesHelperService {
  private readonly rolesRepository: Model<IRole>;

  constructor() {
    this.rolesRepository = RolesModel;
  }

  public async execute(
    payload: Partial<IRolesDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IRole>> {
    try {
      const doc = new this.rolesRepository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.Roles,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new role", errorMap);
    }
  }
}

export default new createRolesHelperService();
