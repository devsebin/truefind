import { IUserTaskMapping } from "@/database/service-user-configuration/service-user-configuration-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../service-user-configuration.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { serviceUserConfigErrorResponse } from "../../service-user-configuration.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class ActivateServiceUserConfigurationHelperService {
  public async execute(
    existing: HydratedDocument<IUserTaskMapping>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId | undefined,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IUserTaskMapping>> {
    try {
      if (existing.is_active && !existing.is_deleted) {
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service user configuration is already active",
            data: serviceUserConfigErrorResponse(existing),
            filler: { 0: existing._id },
          }),
        );
      }

      existing.is_active = true;
      existing.is_deleted = false;
      existing.deleted_at = undefined;
      existing.deleted_by = undefined;
      if (userId) {
        existing.updated_by = userId;
      }

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceUserConfigurations,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<IUserTaskMapping>;
    } catch (error) {
      rethrowIfKnown(error, "Error while activating service user configuration", errorMap);
    }
  }
}

export default new ActivateServiceUserConfigurationHelperService();
