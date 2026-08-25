import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findServiceStatusesHelperService from "../helpers/validators/find-service-statuses.helper.service";
import { serviceStatusesErrorsMessages } from "../service-statuses.messages";
import activateServiceStatusesHelperService from "../helpers/operations/activate-service-statuses.helper.service";
import { serviceStatusesPayload } from "../service-statuses.helper";
import findServiceStatusesStateHelperService from "../helpers/validators/find-service-statuses-state.helper.service";

class enableServiceStatusesService {
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

      await findServiceStatusesStateHelperService.isAlreadyActive(
        serviceStatus[0],
        serviceStatusesErrorsMessages,
      );

      await findServiceStatusesHelperService.execute(
        {
          $or: [
            { title: serviceStatus[0].title },
            { label: serviceStatus[0].label },
          ],
          _id: { $ne: id },
          is_deleted: false,
          is_active: true,
        },
        serviceStatusesErrorsMessages,
        {
          throwIfExists: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      await activateServiceStatusesHelperService.execute(
        serviceStatus[0],
        session,
        userId,
        dbTransactions,
        serviceStatusesErrorsMessages,
      );

      await session.commitTransaction();

      return serviceStatusesPayload(
        "service_statuses_activate",
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

export default new enableServiceStatusesService();
