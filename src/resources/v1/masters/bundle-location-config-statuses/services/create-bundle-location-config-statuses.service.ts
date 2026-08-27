import { SingleResponse } from "@/utils/responses/success.response";
import { IInputIBundleLocationConfigStatusesPayloadStrict } from "../payloads/bundle-location-config-statuses-payload";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toBundleLocationConfigStatusesDTO } from "../dto/create-bundle-location-config-statuses.dto";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { bundleLocationConfigStatusesErrorsMessages } from "../bundle-location-config-statuses.messages";
import {
  populateFields,
  bundleLocationConfigStatusesPayload,
  throwError,
} from "../bundle-location-config-statuses.helper";
import createBundleLocationConfigStatusesHelperService from "../helpers/operations/create-bundle-location-config-statuses.helper.service";
import { bundleLocationConfigStatusesResponse } from "../bundle-location-config-statuses.response";
import BundleLocationConfigStatusesModel from "@/database/bundle-location-config-status/bundle-location-config-status-db-model";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class createBundleLocationConfigStatusesService {
  public async execute(
    request: Request,
    payload?: IInputIBundleLocationConfigStatusesPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(
      request,
      payload,
      toBundleLocationConfigStatusesDTO,
    );

    try {
      session.startTransaction();

      const existingDuplicate =
        await BundleLocationConfigStatusesModel.findOne({
          $or: [{ title: body.title }, { label: body.label }],
          is_deleted: { $in: [true, false] },
        }).session(session);

      if (existingDuplicate) {
        if (!existingDuplicate.is_deleted && existingDuplicate.is_active) {
          const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "bundle location config status already exists",
            data: body,
            filler: { 0: existingDuplicate.title },
          });

          throwError("already_exists", response);
        }

        existingDuplicate.title = body.title;
        existingDuplicate.label = body.label;
        existingDuplicate.color = body.color;

        const defaultExists = await BundleLocationConfigStatusesModel.findOne({
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

        if (body.is_default) {
          await BundleLocationConfigStatusesModel.updateMany(
            { is_default: true, _id: { $ne: existingDuplicate._id } },
            { $set: { is_default: false } },
            { session },
          );
        }

        existingDuplicate.is_deleted = false;
        existingDuplicate.is_active = true;
        existingDuplicate.deleted_at = undefined;
        existingDuplicate.deleted_by = undefined;
        existingDuplicate.updated_by = request.user?._id;

        const saved = await existingDuplicate.save({ session });
        await saved.populate(populateFields);

        DbTransactions.push(
          await createDbTransaction(
            tableName.BundleLocationConfigStatuses,
            apiMethods.POST,
            operationTypes.Create,
            saved.toObject(),
          ),
        );

        await session.commitTransaction();
        return bundleLocationConfigStatusesPayload(
          "bundle_location_config_statuses_created",
          bundleLocationConfigStatusesResponse(saved),
          DbTransactions,
        );
      }

      const defaultExists = await BundleLocationConfigStatusesModel.findOne({
        is_default: true,
        is_deleted: false,
        is_active: true,
      }).session(session);

      if (!defaultExists) {
        body.is_default = true;
      }

      if (body.is_default) {
        await BundleLocationConfigStatusesModel.updateMany(
          { is_default: true },
          { $set: { is_default: false } },
          { session },
        );
      }

      const created =
        await createBundleLocationConfigStatusesHelperService.execute(
          body,
          session,
          DbTransactions,
          bundleLocationConfigStatusesErrorsMessages,
        );

      await created.populate(populateFields);

      await session.commitTransaction();

      return bundleLocationConfigStatusesPayload(
        "bundle_location_config_statuses_created",
        bundleLocationConfigStatusesResponse(created),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        bundleLocationConfigStatusesErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new createBundleLocationConfigStatusesService();
