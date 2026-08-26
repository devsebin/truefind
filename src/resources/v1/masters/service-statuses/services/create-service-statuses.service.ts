import { SingleResponse } from "@/utils/responses/success.response";
import { IInputIServiceStatusesPayloadStrict } from "../payloads/service-statuses-payload";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toServiceStatusesDTO } from "../dto/create-service-statuses.dto";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { serviceStatusesErrorsMessages } from "../service-statuses.messages";
import { populateFields, serviceStatusesPayload, throwError } from "../service-statuses.helper";
import createServiceStatusesHelperService from "../helpers/operations/create-service-statuses.helper.service";
import { serviceStatusesResponse } from "../service-statuses.response";
import ServiceStatusModel from "@/database/service-status/service-status-db-model";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class createServiceStatusesService {
  public async execute(
    request: Request,
    payload?: IInputIServiceStatusesPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toServiceStatusesDTO);

    try {
      session.startTransaction();

      const existingDuplicate = await ServiceStatusModel.findOne({
        $or: [{ title: body.title }, { label: body.label }],
        is_deleted: { $in: [true, false] },
      }).session(session);

      if (existingDuplicate) {
        if (!existingDuplicate.is_deleted && existingDuplicate.is_active) {
          const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "service status already exists",
            data: body,
            filler: { 0: existingDuplicate.title },
          });
          throwError("already_exists", response);
        }

        existingDuplicate.title = body.title;
        existingDuplicate.label = body.label;
        existingDuplicate.color = body.color;

        const defaultExists = await ServiceStatusModel.findOne({
          is_default: true,
          is_deleted: false,
          is_active: true,
          _id: { $ne: existingDuplicate._id },
        }).session(session);

        if (!defaultExists) {
          existingDuplicate.is_default = true;
        } else if (body.is_default) {
          existingDuplicate.is_default = true;
        }

        if (existingDuplicate.is_default) {
          await ServiceStatusModel.updateMany(
            {
              _id: { $ne: existingDuplicate._id },
              is_deleted: false,
              is_active: true,
            },
            { $set: { is_default: false } },
          ).session(session);
        }

        existingDuplicate.is_deleted = false;
        existingDuplicate.is_active = true;

        const saved = await existingDuplicate.save({ session });
        await saved.populate(populateFields);

        DbTransactions.push(
          await createDbTransaction(
            tableName.ServiceStatus,
            apiMethods.POST,
            operationTypes.Create,
            saved.toObject(),
          ),
        );

        await session.commitTransaction();
        return serviceStatusesPayload(
          "service_statuses_created",
          serviceStatusesResponse(saved),
          DbTransactions,
        );
      }

      const defaultExists = await ServiceStatusModel.findOne({
        is_default: true,
        is_deleted: false,
        is_active: true,
      }).session(session);

      if (!defaultExists) {
        body.is_default = true;
      }

      if (body.is_default) {
        await ServiceStatusModel.updateMany(
          { is_deleted: false, is_active: true },
          { $set: { is_default: false } },
        ).session(session);
      }

      const newServiceStatus = await createServiceStatusesHelperService.execute(
        body,
        session,
        DbTransactions,
        serviceStatusesErrorsMessages,
      );

      await newServiceStatus.populate(populateFields);

      await session.commitTransaction();
      return serviceStatusesPayload(
        "service_statuses_created",
        serviceStatusesResponse(newServiceStatus),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceStatusesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new createServiceStatusesService();
