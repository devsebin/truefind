import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { rolesErrorsMessages } from "../roles.messages";
import findRolesHelperService from "../helpers/validators/find-roles.helper.service";
import { populateFields, rolesPayload } from "../roles.helper";
import { rolesResponse } from "../roles.response";

class showRolesService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];

    try {
      const role = await findRolesHelperService.execute(
        { _id: id },
        rolesErrorsMessages,
        {
          lean: true,
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
        },
      );

      return rolesPayload(
        "roles_fetched",
        rolesResponse(role[0]),
        dbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, rolesErrorsMessages, err.data);
    }
  }
}

export default new showRolesService();
