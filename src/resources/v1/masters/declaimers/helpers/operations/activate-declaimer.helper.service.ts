import { IDeclaimer } from "@/database/declaimers/declaimers-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../declaimers.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { declaimerResponse } from "../../declaimers.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class activateDeclaimerHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IDeclaimer>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IDeclaimer>> {
    try {
      if (existing.is_active && !existing.is_deleted) {
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Declaimer is already activated",
            data: declaimerResponse([existing]),
            filler: { 0: existing.title, 1: existing._id },
          }),
        );
      }

      existing.is_active = true;
      existing.is_deleted = false;
      existing.deleted_at = undefined;
      existing.deleted_by = undefined;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Declaimers,
          apiMethods.PATCH,
          operationTypes.Update,
          saved.toObject(),
        ),
      );

      return saved as HydratedDocument<IDeclaimer>;
    } catch (error) {
      rethrowIfKnown(error, "Error while activating declaimer", errorMap);
    }
  }
}

export default new activateDeclaimerHelperService();
