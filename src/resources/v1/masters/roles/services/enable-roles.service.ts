import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findRolesHelperService from "../helpers/validators/find-roles.helper.service";
import { rolesErrorsMessages } from "../roles.messages";
import activateRolesHelperService from "../helpers/operations/activate-roles.helper.service";
import { rolesPayload } from "../roles.helper";
import findRolesStateHelperService from "../helpers/validators/find-roles-state.helper.service";

class enableRolesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
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

      await findRolesStateHelperService.isAlreadyActive(
        role[0],
        rolesErrorsMessages,
      );

      await findRolesHelperService.execute(
        {
          $or: [
            { title: role[0].title },
            { label: role[0].label },
          ],
          _id: { $ne: id },
          is_deleted: false,
          is_active: true,
        },
        rolesErrorsMessages,
        {
          throwIfExists: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      await activateRolesHelperService.execute(
        role[0],
        session,
        userId,
        dbTransactions,
        rolesErrorsMessages,
      );

      await session.commitTransaction();

      return rolesPayload("roles_activate", role, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, rolesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new enableRolesService();
