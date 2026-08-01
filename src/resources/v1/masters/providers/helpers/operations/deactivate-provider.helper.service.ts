import { IProvider } from "@/database/providers/providers-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../providers.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { ProviderResponse } from "../../providers.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class deactivateProviderHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IProvider>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IProvider>> {
    try {
      if (!existing.is_active || existing.is_deleted) {
        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Provider is already inactive",
            data: ProviderResponse([existing]),
            filler: { 0: existing.name, 1: existing._id },
          }),
        );
      }

      existing.is_active = false;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Providers,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<IProvider>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deactivating provider", errorMap);
    }
  }
}

export default new deactivateProviderHelperService();
