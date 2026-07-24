import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import { Request } from "express";
import mongoose from "mongoose";
import findStatusHelperService from "../helpers/validators/find-status.helper.service";
import { IInputStatusPayloadStrict } from "../payloads/create-status.payload";
import { populateFields, statusPayload } from "../statuses.helper";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { statusesErrorsMessages } from "../statuses.messages";
import { toStatusDTO } from "../dto/status.dto";
import createStatusHelperService from "../helpers/operations/create-status.helper.service";
import findStatusDefaultHelperService from "../helpers/validators/find-default.helper.service";
import { statusResponse } from "../statuses.response";

class createStatusService {
  public async execute(
    request: Request,
    payload?: IInputStatusPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toStatusDTO);

    try {
      session.startTransaction();

      // check if status already exists
      await findStatusHelperService.execute(
        {
          label: body.label,
          is_active: true,
        },
        statusesErrorsMessages,
        {
          throwIfExists: true,
          lean: true,
          returnDocument: false,
        },
      );

      const bodyWithDefault = await findStatusDefaultHelperService.execute(
        body,
        statusesErrorsMessages,
        { setDefault: true, session },
      );
      bodyWithDefault.created_by = request.user?.id;
      // create new status
      const newStatus = await createStatusHelperService.execute(
        bodyWithDefault,
        session,
        DbTransactions,
        statusesErrorsMessages,
      );

      // populate status
      await newStatus.populate(populateFields);

      await session.commitTransaction();

      return statusPayload(
        "status_created",
        statusResponse(newStatus),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, statusesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new createStatusService();
