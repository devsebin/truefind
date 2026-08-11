import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { Request } from "express";
import findDeclaimerHelperService from "../helpers/validators/find-declaimer.helper.service";
import { declaimerPayload, populateFields } from "../declaimers.helper";
import { declaimerErrorsMessages } from "../declaimers.messages";
import updateDeclaimerHelperService from "../helpers/operations/update-declaimer.helper.service";
import { IUpdateDeclaimerPayloadStrict } from "../payloads/declaimer-payload";
import { declaimerResponse } from "../declaimers.response";

class updateDeclaimerService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: IUpdateDeclaimerPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Find existing declaimer (latest active version)
      const existing = await findDeclaimerHelperService.execute(
        { _id: id },
        declaimerErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const body = payload ?? (request.body as IUpdateDeclaimerPayloadStrict);

      // Create new version with updated fields
      const userId = request.user?.id;
      const updated = await updateDeclaimerHelperService.execute(
        id,
        {
          ...body,
          updated_by: userId,
        },
        existing[0],
        session,
        DbTransactions,
        declaimerErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return declaimerPayload(
        "declaimer_updated",
        declaimerResponse(updated),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, declaimerErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new updateDeclaimerService();
