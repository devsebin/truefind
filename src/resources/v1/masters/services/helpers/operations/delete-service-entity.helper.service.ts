import { BaseServiceModel } from "@/database/services/services-db-model";
import { throwError } from "../../services.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { servicesErrorsMessages } from "../../services.messages";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import mongoose from "mongoose";

class deleteServiceEntityHelperService {
  public async execute(
    existing: any,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    force: boolean,
    dbTransactions: DbTransaction[],
  ): Promise<any> {
    try {
      if (existing.is_deleted) {
        throwError(
          "something_went_wrong",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Entity is already deleted",
            data: existing,
          }),
        );
      }

      if (existing.is_active && !force) {
        throwError(
          "something_went_wrong",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Confirmation required to delete (entity is currently active)",
            data: existing,
          }),
        );
      }

      existing.is_deleted = true;
      existing.is_active = false;
      existing.deleted_by = userId;
      existing.deleted_at = new Date();

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Services,
          apiMethods.DELETE,
          operationTypes.Delete,
          saved,
        ),
      );

      return saved;
    } catch (error) {
      rethrowIfKnown(error, "Error while deleting service entity", servicesErrorsMessages);
    }
  }
}

export default new deleteServiceEntityHelperService();
