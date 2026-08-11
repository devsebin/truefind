import { IDeclaimer } from "@/database/declaimers/declaimers-db-interface";
import DeclaimerModel from "@/database/declaimers/declaimers-db-model";
import mongoose, { ClientSession, HydratedDocument, Model } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { IUpdateDeclaimerPayloadStrict } from "../../payloads/declaimer-payload";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../declaimers.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { declaimerResponse } from "../../declaimers.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class updateDeclaimerHelperService {
  private readonly declaimerRepository: Model<IDeclaimer>;

  constructor() {
    this.declaimerRepository = DeclaimerModel;
  }

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: IUpdateDeclaimerPayloadStrict & { updated_by?: string },
    existing: HydratedDocument<IDeclaimer>,
    session: ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IDeclaimer>> {
    try {
      // Find changes
      const changes = updatedFields(payload, existing.toObject());
      if (changes.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
          message: "No changes detected",
          data: { declaimerId: id },
          filler: { declaimerId: id },
        });
        throwError("no_changes_detected", response);
      }

      // Get next version
      const nextVersion = await this.getNextVersion(
        existing.key,
        existing.language,
        existing.country,
        session,
      );

      // Mark old versions as NOT latest
      await this.declaimerRepository.updateMany(
        {
          key: existing.key,
          language: existing.language,
          country: existing.country,
          is_latest: true,
        },
        { $set: { is_latest: false } },
        { session },
      );

      // Create new document version
      const newDocObj = {
        key: existing.key,
        language: existing.language,
        country: existing.country,
        title: payload.title !== undefined ? payload.title : existing.title,
        content: payload.content !== undefined ? payload.content : existing.content,
        metadata: payload.metadata !== undefined ? payload.metadata : existing.metadata,
        version: nextVersion,
        is_latest: true,
        is_active: true,
        is_deleted: false,
        created_by: existing.created_by,
        updated_by: payload.updated_by,
      };

      const created = await this.declaimerRepository.create([newDocObj], {
        session,
      });

      if (!created || created.length === 0) {
        const response = ResponseBuilder.error(
          ErrorTypes.INTERNAL_SERVER_ERROR,
          {
            message: "Failed to create new declaimer version",
            data: {},
            filler: {},
          },
        );
        throwError("declaimer_not_created", response);
      }

      const newDoc = created[0];

      // Track changes in audit log
      dbTransactions.push(
        await createDbTransaction(
          tableName.Declaimers,
          apiMethods.PUT,
          operationTypes.Update,
          newDoc.toObject(),
          changes,
        ),
      );

      return newDoc;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating declaimer version", errorMap);
    }
  }

  private async getNextVersion(
    key: string,
    language: string,
    country: mongoose.Types.ObjectId | string | null,
    session: ClientSession,
  ): Promise<number> {
    const lastDoc = await this.declaimerRepository
      .findOne({ key, language, country })
      .sort({ version: -1 })
      .session(session);

    return lastDoc ? lastDoc.version + 1 : 1;
  }
}

export default new updateDeclaimerHelperService();
