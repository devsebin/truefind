import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import mongoose, { HydratedDocument } from "mongoose";
import { IInputIServiceStatusesPayloadStrict } from "../../payloads/service-statuses-payload";
import { IServiceStatus } from "@/database/service-status/service-status-db-interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../service-statuses.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { serviceStatusesErrorResponse } from "../../service-statuses.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class updateServiceStatusesHelperService {
  constructor() {}

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: Partial<IInputIServiceStatusesPayloadStrict>,
    existing: HydratedDocument<IServiceStatus>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceStatus>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = serviceStatusesErrorResponse(existing);
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
      if (payload.is_default !== undefined)
        existing.is_default = payload.is_default;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceStatus,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved as HydratedDocument<IServiceStatus>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating service status", errorMap);
    }
  }
}

export default new updateServiceStatusesHelperService();
