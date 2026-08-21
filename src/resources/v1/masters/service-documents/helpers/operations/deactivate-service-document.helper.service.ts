import { IServiceDocumentRequirements } from "@/database/service-documents/service-documents-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../service-documents.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { serviceDocumentErrorResponse } from "../../service-documents.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class deactivateServiceDocumentHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<IServiceDocumentRequirements>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceDocumentRequirements>> {
    try {
      if (!existing.is_active || existing.is_deleted) {
        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service document is already inactive",
            data: serviceDocumentErrorResponse(existing),
            filler: { 0: existing.name, 1: existing._id },
          }),
        );
      }

      existing.is_active = false;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceDocuments,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<IServiceDocumentRequirements>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deactivating service document", errorMap);
    }
  }
}

export default new deactivateServiceDocumentHelperService();
