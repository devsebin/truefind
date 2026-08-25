import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { Request } from "express";
import findServiceStatusesHelperService from "../helpers/validators/find-service-statuses.helper.service";
import { populateFields, serviceStatusesPayload } from "../service-statuses.helper";
import { serviceStatusesErrorsMessages } from "../service-statuses.messages";
import updateServiceStatusesHelperService from "../helpers/operations/update-service-statuses.helper.service";
import { IInputIServiceStatusesPayloadStrict } from "../payloads/service-statuses-payload";
import { serviceStatusesResponse } from "../service-statuses.response";
import ServiceStatusModel from "@/database/service-status/service-status-db-model";

class updateServiceStatusesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: Partial<IInputIServiceStatusesPayloadStrict>,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await findServiceStatusesHelperService.execute(
        { _id: id },
        serviceStatusesErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const body =
        payload ?? (request.body as Partial<IInputIServiceStatusesPayloadStrict>);

      const queryOr: any[] = [];
      if (body.title && body.title !== existing[0].title)
        queryOr.push({ title: body.title });
      if (body.label && body.label !== existing[0].label)
        queryOr.push({ label: body.label });

      if (queryOr.length > 0) {
        const existingDuplicate = await ServiceStatusModel.findOne({
          $or: queryOr,
          _id: { $ne: id },
          is_deleted: { $in: [true, false] },
        }).session(session);

        if (existingDuplicate) {
          if (!existingDuplicate.is_deleted && existingDuplicate.is_active) {
            throw new Error("already_exists");
          }

          existingDuplicate.title = `${existingDuplicate.title}_deleted_${Date.now()}`;
          existingDuplicate.label = `${existingDuplicate.label}_deleted_${Date.now()}`;
          await existingDuplicate.save({ session });
        }
      }

      if (body.is_default === false && existing[0].is_default === true) {
        const otherDefault = await ServiceStatusModel.findOne({
          _id: { $ne: id },
          is_default: true,
          is_deleted: false,
          is_active: true,
        }).session(session);
        if (!otherDefault) {
          body.is_default = true;
        }
      }

      if (body.is_default === true) {
        await ServiceStatusModel.updateMany(
          { _id: { $ne: id }, is_deleted: false, is_active: true },
          { $set: { is_default: false } },
        ).session(session);
      }

      const updated = await updateServiceStatusesHelperService.execute(
        id,
        body,
        existing[0],
        session,
        DbTransactions,
        serviceStatusesErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return serviceStatusesPayload(
        "service_statuses_updated",
        serviceStatusesResponse(updated),
        DbTransactions,
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

export default new updateServiceStatusesService();
