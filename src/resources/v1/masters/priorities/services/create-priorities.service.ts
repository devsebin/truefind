import { SingleResponse } from "@/utils/responses/success.response";
import { IInputIPrioritiesPayloadStrict } from "../payloads/priorities-payload";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toPrioritiesDTO } from "../dto/create-priorities.dto";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { prioritiesErrorsMessages } from "../priorities.messages";
import findPrioritiesHelperService from "../helpers/validators/find-priorities.helper.service";
import { populateFields, prioritiesPayload, throwError } from "../priorities.helper";
import createPrioritiesHelperService from "../helpers/operations/create-priorities.helper.service";
import { prioritiesResponse } from "../priorities.response";
import PrioritiesModel from "@/database/priorities/priorities-db-model";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class createPrioritiesService {
  public async execute(
    request: Request,
    payload?: IInputIPrioritiesPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toPrioritiesDTO);

    try {
      session.startTransaction();

      const existingDuplicate = await PrioritiesModel.findOne({
        $or: [
          { title: body.title },
          { label: body.label },
        ],
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

        existingDuplicate.title = body.title;
        existingDuplicate.label = body.label;
        existingDuplicate.color = body.color;

        const defaultPriorityExists = await PrioritiesModel.findOne({
          is_default: true,
          is_deleted: false,
          is_active: true,
          _id: { $ne: existingDuplicate._id },
        }).session(session);

        if (!defaultPriorityExists) {
          existingDuplicate.is_default = true;
        } else if (body.is_default) {
          existingDuplicate.is_default = true;
        }

        if (existingDuplicate.is_default) {
          await PrioritiesModel.updateMany(
            { _id: { $ne: existingDuplicate._id }, is_deleted: false, is_active: true },
            { $set: { is_default: false } },
          ).session(session);
        }

        existingDuplicate.is_deleted = false;
        existingDuplicate.is_active = true;

        const saved = await existingDuplicate.save({ session });
        await saved.populate(populateFields);

        DbTransactions.push(
          await createDbTransaction(
            tableName.Priorities,
            apiMethods.POST,
            operationTypes.Create,
            saved.toObject(),
          ),
        );

        await session.commitTransaction();
        return prioritiesPayload(
          "priorities_created",
          prioritiesResponse(saved),
          DbTransactions,
        );
      }

      const defaultPriorityExists = await PrioritiesModel.findOne({
        is_default: true,
        is_deleted: false,
        is_active: true,
      }).session(session);

      if (!defaultPriorityExists) {
        body.is_default = true;
      }

      if (body.is_default) {
        await PrioritiesModel.updateMany(
          { is_deleted: false, is_active: true },
          { $set: { is_default: false } },
        ).session(session);
      }

      const newPriority = await createPrioritiesHelperService.execute(
        body,
        session,
        DbTransactions,
        prioritiesErrorsMessages,
      );

      await newPriority.populate(populateFields);

      await session.commitTransaction();
      return prioritiesPayload(
        "priorities_created",
        prioritiesResponse(newPriority),
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

export default new createPrioritiesService();
