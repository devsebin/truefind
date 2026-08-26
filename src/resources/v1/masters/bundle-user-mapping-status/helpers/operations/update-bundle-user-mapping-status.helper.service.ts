import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import mongoose, { HydratedDocument } from "mongoose";
import { IInputIBundleUserMappingStatusPayloadStrict } from "../../payloads/bundle-user-mapping-status-payload";
import { IBundleUserMappingStatus } from "@/database/bundle-user-mapping-status/bundle-user-mapping-status-db-interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../bundle-user-mapping-status.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { bundleUserMappingStatusErrorResponse } from "../../bundle-user-mapping-status.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class updateBundleUserMappingStatusHelperService {
  constructor() {}

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: Partial<IInputIBundleUserMappingStatusPayloadStrict>,
    existing: HydratedDocument<IBundleUserMappingStatus>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleUserMappingStatus>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = bundleUserMappingStatusErrorResponse(existing);
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
          tableName.BundleUserMappingStatuses,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved as HydratedDocument<IBundleUserMappingStatus>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating bundle user mapping status", errorMap);
    }
  }
}

export default new updateBundleUserMappingStatusHelperService();
