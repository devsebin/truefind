import mongoose, { HydratedDocument, Model } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IAuthSession } from "@/database/auth-sessions/auth-session-db-interface";
import RefreshSessionModel from "@/database/auth-sessions/auth-session-db-model";
import { throwError } from "../../auth-sessions.helper";

class createAuthSessionHelperService {
  private readonly authSessionRepository: Model<IAuthSession>;

  constructor() {
    this.authSessionRepository = RefreshSessionModel;
  }

  public async execute(
    payload: IAuthSession,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IAuthSession>> {
    try {
      const doc = await this.authSessionRepository.create([payload], { session });
      if (!doc || doc.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.INTERNAL_SERVER_ERROR, {
          message: "Error while creating auth session",
          data: { payload },
        });
        return throwError("auth_session_not_created", response);
      }

      DbTransactions.push(
        await createDbTransaction(
          tableName.RefreshSessions,
          apiMethods.POST,
          operationTypes.Create,
          doc[0].toObject(),
        ),
      );

      return doc[0];
    } catch (error) {
      rethrowIfKnown(error, "Error while creating auth session", errorMap);
    }
  }
}

export default new createAuthSessionHelperService();
