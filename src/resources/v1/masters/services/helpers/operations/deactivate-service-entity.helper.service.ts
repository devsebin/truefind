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

class deactivateServiceEntityHelperService {
  public async execute(
    existing: any,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
  ): Promise<any> {
    try {
      if (!existing.is_active || existing.is_deleted) {
        throwError(
          "something_went_wrong",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Entity is already inactive",
            data: existing,
          }),
        );
      }

      existing.is_active = false;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Services,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved;
    } catch (error) {
      rethrowIfKnown(error, "Error while deactivating service entity", servicesErrorsMessages);
    }
  }
}

export default new deactivateServiceEntityHelperService();
