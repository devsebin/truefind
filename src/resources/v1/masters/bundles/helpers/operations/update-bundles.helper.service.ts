import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import mongoose, { HydratedDocument } from "mongoose";
import { IInputIBundlesPayloadStrict } from "../../payloads/bundle-payload";
import { IBundleDocument } from "@/database/bundles/bundles-db-interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../bundles.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { bundleErrorResponse } from "../../bundles.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class updateBundlesHelperService {
  constructor() {}

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: Partial<IInputIBundlesPayloadStrict>,
    existing: HydratedDocument<IBundleDocument>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleDocument>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = bundleErrorResponse(existing);
        throwError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data,
            filler: { 0: existing.code, 1: existing._id },
          }),
        );
      }

      if (payload.name !== undefined) existing.name = payload.name;
      if (payload.display_name !== undefined) existing.display_name = payload.display_name;
      if (payload.code !== undefined) existing.code = payload.code;
      if (payload.description !== undefined) existing.description = payload.description;
      if (payload.icon !== undefined) existing.icon = new mongoose.Types.ObjectId(payload.icon);
      if (payload.status_id !== undefined) existing.status_id = new mongoose.Types.ObjectId(payload.status_id);
      if (payload.sort_order !== undefined) existing.sort_order = payload.sort_order;
      if (payload.tags !== undefined) existing.tags = payload.tags;
      if (payload.metadata !== undefined) existing.metadata = payload.metadata;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Bundles,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved as HydratedDocument<IBundleDocument>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating bundle", errorMap);
    }
  }
}

export default new updateBundlesHelperService();
