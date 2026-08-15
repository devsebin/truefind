import IRole from "@/database/roles/roles-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../roles.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rolesErrorResponse } from "../../roles.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class deactivateRolesHelperService {
  constructor() { }

  public async execute(
    existing: HydratedDocument<IRole>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IRole>> {
    try {
      if (!existing.is_active || existing.is_deleted) {
        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Role is already inactive",
            data: rolesErrorResponse(existing),
            filler: { 0: existing.title, 1: existing._id },
          }),
        );
      }

      existing.is_active = false;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Roles,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<IRole>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deactivating role", errorMap);
    }
  }
}

export default new deactivateRolesHelperService();
