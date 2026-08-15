import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import mongoose, { HydratedDocument } from "mongoose";
import { IInputIRolesPayloadStrict } from "../../payloads/roles-payload";
import IRole from "@/database/roles/roles-db-interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../roles.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rolesErrorResponse } from "../../roles.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class updateRolesHelperService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: Partial<IInputIRolesPayloadStrict>,
    existing: HydratedDocument<IRole>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IRole>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = rolesErrorResponse(existing);
        throwError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data,
            filler: { 0: existing.label, 1: existing._id },
          }),
        );
      }

      if (payload.title !== undefined) existing.title = payload.title;
      if (payload.label !== undefined) existing.label = payload.label;
      if (payload.color !== undefined) existing.color = payload.color;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Roles,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved as HydratedDocument<IRole>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating role", errorMap);
    }
  }
}

export default new updateRolesHelperService();
