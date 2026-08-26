import { IBundleDocument } from "@/database/bundles/bundles-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../bundles.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { bundleErrorResponse } from "../../bundles.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class deactivateBundlesHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IBundleDocument>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IBundleDocument>> {
    try {
      if (!existing.is_active || existing.is_deleted) {
        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Bundle is already inactive",
            data: bundleErrorResponse(existing),
            filler: { 0: existing.code, 1: existing._id },
          }),
        );
      }

      existing.is_active = false;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Bundles,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<IBundleDocument>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deactivating bundle", errorMap);
    }
  }
}

export default new deactivateBundlesHelperService();
