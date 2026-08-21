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
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { IUpdateServiceUserConfigPayload } from "../../payloads/service-user-configuration.payload";

class UpdateServiceUserConfigurationHelperService {
  public async execute(
    id: mongoose.Types.ObjectId,
    payload: IUpdateServiceUserConfigPayload,
    existing: HydratedDocument<IUserTaskMapping>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId | undefined,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IUserTaskMapping>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = serviceUserConfigErrorResponse(existing);
        throwError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data,
            filler: { 0: existing._id },
          }),
        );
      }

      if (payload.eligibility_status !== undefined) {
        existing.eligibility_status = payload.eligibility_status;
      }
      if (payload.is_active !== undefined) {
        existing.is_active = payload.is_active;
      }
      if (userId) {
        existing.updated_by = userId;
      }

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceUserConfigurations,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved as HydratedDocument<IUserTaskMapping>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating service user configuration", errorMap);
    }
  }
}

export default new UpdateServiceUserConfigurationHelperService();
