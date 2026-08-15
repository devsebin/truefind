import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findRolesHelperService from "../helpers/validators/find-roles.helper.service";
import { rolesErrorsMessages } from "../roles.messages";
import deleteRolesHelperService from "../helpers/operations/delete-roles.helper.service";
import { rolesPayload } from "../roles.helper";
import findRolesStateHelperService from "../helpers/validators/find-roles-state.helper.service";

class deleteRolesService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    is_force: boolean,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const role = await findRolesHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        rolesErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findRolesStateHelperService.isAlreadyDeleted(
        role[0],
        rolesErrorsMessages,
      );

      await deleteRolesHelperService.execute(
        role[0],
        session,
        userId,
        is_force,
        dbTransactions,
        rolesErrorsMessages,
      );

      await session.commitTransaction();

      return rolesPayload("roles_deleted", role, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, rolesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new deleteRolesService();
