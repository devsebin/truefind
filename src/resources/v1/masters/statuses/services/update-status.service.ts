import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { statusesErrorsMessages } from "../statuses.messages";
import findStatusHelperService from "../helpers/validators/find-status.helper.service";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { Request } from "express";
import { toStatusDTO } from "../dto/status.dto";
import { IUpdateStatusPayloadStrict } from "../payloads/create-status.payload";
import updateStatusHelperService from "../helpers/operations/update-status.helper.service";
import { statusPayload } from "../statuses.helper";

class updateStatusesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: IUpdateStatusPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toStatusDTO);

    try {
      session.startTransaction();

      const status = await findStatusHelperService.execute(
        { _id: id },
        statusesErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      // ✅ Perform the update
      const updatedStatus = await updateStatusHelperService.execute(
        id,
        body,
        status[0],
        session,
        dbTransactions,
        statusesErrorsMessages,
      );

      await session.commitTransaction();

      return statusPayload("status_updated", updatedStatus, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, statusesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new updateStatusesService();
