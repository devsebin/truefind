import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { Request } from "express";
import findPrioritiesHelperService from "../helpers/validators/find-priorities.helper.service";
import { populateFields, prioritiesPayload, throwError } from "../priorities.helper";
import { prioritiesErrorsMessages } from "../priorities.messages";
import updatePrioritiesHelperService from "../helpers/operations/update-priorities.helper.service";
import { IInputIPrioritiesPayloadStrict } from "../payloads/priorities-payload";
import { prioritiesResponse } from "../priorities.response";
import PrioritiesModel from "@/database/priorities/priorities-db-model";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class updatePrioritiesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: Partial<IInputIPrioritiesPayloadStrict>,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await findPrioritiesHelperService.execute(
        { _id: id },
        prioritiesErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const body = payload ?? (request.body as Partial<IInputIPrioritiesPayloadStrict>);

      const queryOr: any[] = [];
      if (body.title && body.title !== existing[0].title) queryOr.push({ title: body.title });
      if (body.label && body.label !== existing[0].label) queryOr.push({ label: body.label });

      if (queryOr.length > 0) {
        const existingDuplicate = await PrioritiesModel.findOne({
          $or: queryOr,
          _id: { $ne: id },
          is_deleted: { $in: [true, false] },
        }).session(session);

        if (existingDuplicate) {
          if (!existingDuplicate.is_deleted && existingDuplicate.is_active) {
            const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
              message: "priority already exists",
              data: body,
              filler: { 0: existingDuplicate.title },
            });
            throwError("already_exists", response);
          }

          existingDuplicate.title = `${existingDuplicate.title}_deleted_${Date.now()}`;
          existingDuplicate.label = `${existingDuplicate.label}_deleted_${Date.now()}`;
          await existingDuplicate.save({ session });
        }
      }

      if (body.is_default === false && existing[0].is_default === true) {
        const otherDefault = await PrioritiesModel.findOne({
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
        await PrioritiesModel.updateMany(
          { _id: { $ne: id }, is_deleted: false, is_active: true },
          { $set: { is_default: false } },
        ).session(session);
      }

      const updated = await updatePrioritiesHelperService.execute(
        id,
        body,
        existing[0],
        session,
        DbTransactions,
        prioritiesErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return prioritiesPayload(
        "priorities_updated",
        prioritiesResponse(updated),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, prioritiesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new updatePrioritiesService();
