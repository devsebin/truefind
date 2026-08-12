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
import findStatusHelperService from "../../../statuses/helpers/validators/find-status.helper.service";
import { statusesErrorsMessages } from "../../../statuses/statuses.messages";

class activateServiceEntityHelperService {
  public async execute(
    existing: any,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
  ): Promise<any> {
    try {
      if (existing.is_active && !existing.is_deleted) {
        throwError(
          "something_went_wrong",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Entity is already active",
            data: existing,
          }),
        );
      }

      // Fetch active status
      const activeStatuses = await findStatusHelperService.execute(
        { label: "active", is_active: true },
        statusesErrorsMessages,
        { throwIfNotFound: false, session }
      );
      let activeStatusId = activeStatuses && activeStatuses.length > 0 ? activeStatuses[0]._id : undefined;

      if (!activeStatusId) {
        const defaultStatuses = await findStatusHelperService.execute(
          { is_default: true, is_active: true },
          statusesErrorsMessages,
          { throwIfNotFound: false, session }
        );
        if (defaultStatuses && defaultStatuses.length > 0) {
          activeStatusId = defaultStatuses[0]._id;
        }
      }

      existing.is_active = true;
      existing.is_deleted = false;
      if (activeStatusId) {
        existing.status_id = activeStatusId;
      }
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
      rethrowIfKnown(error, "Error while activating service entity", servicesErrorsMessages);
    }
  }
}

export default new activateServiceEntityHelperService();
