import IDocument from "@/database/documents/documents-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class deleteDocumentHelperService {
  public async execute(
    document: HydratedDocument<IDocument>,
    deletedStatusId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IDocument>> {
    try {
      const snapshot = document.toObject();

      document.set({
        is_deleted: true,
        is_active: false,
        deleted_at: new Date(),
        deleted_by: userId,
        status_id: deletedStatusId,
      });

      await document.save({ session });

      const changes = updatedFields(document.toObject(), snapshot);

      if (changes.length > 0) {
        dbTransactions.push(
          await createDbTransaction(
            tableName.Documents,
            apiMethods.DELETE,
            operationTypes.Delete,
            snapshot,
            changes,
          ),
        );
      }
      return document;
    } catch (error) {
      rethrowIfKnown(error, "Error while soft deleting document", errorMap);
    }
  }
}

export default new deleteDocumentHelperService();
