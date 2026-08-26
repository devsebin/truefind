import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findServiceStatusesHelperService from "../helpers/validators/find-service-statuses.helper.service";
import { serviceStatusesErrorsMessages } from "../service-statuses.messages";
import deleteServiceStatusesHelperService from "../helpers/operations/delete-service-statuses.helper.service";
import { populateFields, serviceStatusesPayload, throwError } from "../service-statuses.helper";
import findServiceStatusesStateHelperService from "../helpers/validators/find-service-statuses-state.helper.service";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class deleteServiceStatusesService {
  constructor() {}

  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    is_force: boolean,
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

      await findServiceStatusesStateHelperService.isAlreadyDeleted(
        serviceStatus[0],
        serviceStatusesErrorsMessages,
      );

      if (serviceStatus[0].is_default) {
        const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
          message: "Cannot delete default service status",
          data: { _id: id },
          filler: { 0: serviceStatus[0].title },
        });
        throwError("cannot_delete_default", response);
      }

      await deleteServiceStatusesHelperService.execute(
        serviceStatus[0],
        session,
        userId,
        is_force,
        dbTransactions,
        serviceStatusesErrorsMessages,
      );

      await session.commitTransaction();

      return serviceStatusesPayload(
        "service_statuses_deleted",
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

export default new deleteServiceStatusesService();
