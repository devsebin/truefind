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

class DeleteServiceUserConfigurationHelperService {
  public async execute(
    existing: HydratedDocument<IUserTaskMapping>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId | undefined,
    force: boolean,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IUserTaskMapping>> {
    try {
      if (existing.is_deleted) {
        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service user configuration is already deleted",
            data: serviceUserConfigErrorResponse(existing),
            filler: { 0: existing._id },
          }),
        );
      }

      if (existing.is_active && !force) {
        throwError(
          "confirmation_required",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Confirmation required to delete service user configuration",
            data: serviceUserConfigErrorResponse(existing),
          }),
        );
      }

      existing.is_deleted = true;
      existing.is_active = false;
      if (userId) {
        existing.deleted_by = userId;
      }
      existing.deleted_at = new Date();

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceUserConfigurations,
          apiMethods.DELETE,
          operationTypes.Delete,
          saved,
        ),
      );

      return saved as HydratedDocument<IUserTaskMapping>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deleting service user configuration", errorMap);
    }
  }
}

export default new DeleteServiceUserConfigurationHelperService();
