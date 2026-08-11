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

class deleteDeclaimerHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IDeclaimer>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    force: boolean,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IDeclaimer>> {
    try {
      if (existing.is_deleted) {
        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Declaimer is already deleted",
            data: declaimerResponse([existing]),
            filler: { 0: existing.title, 1: existing._id },
          }),
        );
      }

      if (existing.is_active && !force) {
        throwError(
          "confirmation_required",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Confirmation required to delete declaimer",
            data: declaimerResponse([existing]),
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
          tableName.Declaimers,
          apiMethods.DELETE,
          operationTypes.Delete,
          saved.toObject(),
        ),
      );

      return saved as HydratedDocument<IDeclaimer>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deleting declaimer", errorMap);
    }
  }
}

export default new deleteDeclaimerHelperService();
