import { IServiceInformation } from "@/database/service-informations/service-information-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwServiceInformationError } from "../../service-informations.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class UpdateServiceInformationHelperService {
  public async execute(
    id: mongoose.Types.ObjectId,
    payload: any,
    existing: HydratedDocument<IServiceInformation>,
    userId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceInformation>> {
    try {
      const snapshot = existing.toObject();

      let changed = false;

      if (payload.how_it_works !== undefined) {
        existing.how_it_works = payload.how_it_works;
        changed = true;
      }

      if (payload.included_items !== undefined) {
        existing.included_items = payload.included_items;
        changed = true;
      }

      if (payload.insurance_coverage !== undefined) {
        existing.insurance_coverage = payload.insurance_coverage;
        changed = true;
      }

      if (payload.faqs !== undefined) {
        existing.faqs = payload.faqs;
        changed = true;
      }

      if (payload.disclaimers !== undefined) {
        existing.disclaimers = payload.disclaimers;
        changed = true;
      }

      if (payload.is_active !== undefined && payload.is_active !== existing.is_active) {
        existing.is_active = payload.is_active;
        changed = true;
      }

      if (payload.status_id !== undefined && payload.status_id.toString() !== existing.status_id?.toString()) {
        existing.status_id = payload.status_id;
        changed = true;
      }

      if (payload.is_deleted !== undefined && payload.is_deleted !== existing.is_deleted) {
        existing.is_deleted = payload.is_deleted;
        if (payload.is_deleted) {
          existing.deleted_at = new Date();
          if (userId) existing.deleted_by = userId;
        }
        changed = true;
      }

      if (!changed) {
        throwServiceInformationError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data: { id },
          }),
        );
      }

      if (userId) {
        existing.updated_by = userId;
      }

      const saved = await existing.save({ session });
      const changes = updatedFields(saved.toObject(), snapshot);

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceInformation,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating service information", errorMap);
    }
  }
}

export default new UpdateServiceInformationHelperService();
