import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findServiceStatusesHelperService from "../helpers/validators/find-service-statuses.helper.service";
import { serviceStatusesErrorsMessages } from "../service-statuses.messages";
import deactivateServiceStatusesHelperService from "../helpers/operations/deactivate-service-statuses.helper.service";
import { serviceStatusesPayload } from "../service-statuses.helper";
import findServiceStatusesStateHelperService from "../helpers/validators/find-service-statuses-state.helper.service";

class disableServiceStatusesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const serviceStatus = await findServiceStatusesHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        serviceStatusesErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findServiceStatusesStateHelperService.isAlreadyInactive(
        serviceStatus[0],
        serviceStatusesErrorsMessages,
      );

      if (serviceStatus[0].is_default) {
        throw new Error("cannot_disable_default");
      }

      await deactivateServiceStatusesHelperService.execute(
        serviceStatus[0],
        session,
        userId,
        dbTransactions,
        serviceStatusesErrorsMessages,
      );

      await session.commitTransaction();

      return serviceStatusesPayload(
        "service_statuses_deactivate",
        serviceStatus,
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        serviceStatusesErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new disableServiceStatusesService();
