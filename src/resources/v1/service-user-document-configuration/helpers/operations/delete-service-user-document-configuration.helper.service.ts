import { IServiceUserDocumentConfiguration } from "@/database/service-user-document-configuration/service-user-document-configuration-db-interface";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { tableName } from "@/utils/definitions/constants/table-names";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { throwError } from "../../service-user-document-configuration.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { serviceUserDocConfigErrorResponse } from "../../service-user-document-configuration.response";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import mongoose, { HydratedDocument } from "mongoose";

class DeleteServiceUserDocumentConfigurationHelperService {
  public async execute(
    existing: HydratedDocument<IServiceUserDocumentConfiguration>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId | undefined,
    force: boolean,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceUserDocumentConfiguration>> {
    try {
      if (existing.is_deleted) {
        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service user document configuration is already deleted",
            data: serviceUserDocConfigErrorResponse(existing),
            filler: { 0: existing._id },
          }),
        );
      }

      if (existing.is_active && !force) {
        throwError(
          "confirmation_required",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Confirmation required to delete service user document configuration",
            data: serviceUserDocConfigErrorResponse(existing),
          }),
        );
      }

      existing.is_deleted = true;
      existing.is_active = false;
      if (userId) {
        existing.deleted_by = userId;
      }
      existing.deleted_at = new Date();

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceUserDocumentConfigurations,
          apiMethods.DELETE,
          operationTypes.Delete,
          saved,
        ),
      );

      return saved as HydratedDocument<IServiceUserDocumentConfiguration>;
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while deleting service user document configuration",
        errorMap,
      );
    }
  }
}

export default new DeleteServiceUserDocumentConfigurationHelperService();
