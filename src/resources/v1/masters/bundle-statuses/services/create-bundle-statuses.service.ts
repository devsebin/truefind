import { SingleResponse } from "@/utils/responses/success.response";
import { IInputIBundleStatusesPayloadStrict } from "../payloads/bundle-statuses-payload";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toBundleStatusesDTO } from "../dto/create-bundle-statuses.dto";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { bundleStatusesErrorsMessages } from "../bundle-statuses.messages";
import { populateFields, bundleStatusesPayload } from "../bundle-statuses.helper";
import createBundleStatusesHelperService from "../helpers/operations/create-bundle-statuses.helper.service";
import { bundleStatusesResponse } from "../bundle-statuses.response";
import BundleStatusesModel from "@/database/bundle-statuses/bundle-statuses-db-model";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";

class createBundleStatusesService {
  public async execute(
    request: Request,
    payload?: IInputIBundleStatusesPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toBundleStatusesDTO);

    try {
      session.startTransaction();

      const existingDuplicate = await BundleStatusesModel.findOne({
        $or: [{ title: body.title }, { label: body.label }],
        is_deleted: { $in: [true, false] },
      }).session(session);

      if (existingDuplicate) {
        if (!existingDuplicate.is_deleted && existingDuplicate.is_active) {
          throw new Error("already_exists");
        }

        existingDuplicate.title = body.title;
        existingDuplicate.label = body.label;
        existingDuplicate.color = body.color;

        const defaultExists = await BundleStatusesModel.findOne({
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
          await BundleStatusesModel.updateMany(
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
            tableName.BundleStatuses,
            apiMethods.POST,
            operationTypes.Create,
            saved.toObject(),
          ),
        );

        await session.commitTransaction();
        return bundleStatusesPayload(
          "bundle_statuses_created",
          bundleStatusesResponse(saved),
          DbTransactions,
        );
      }

      const defaultExists = await BundleStatusesModel.findOne({
        is_default: true,
        is_deleted: false,
        is_active: true,
      }).session(session);

      if (!defaultExists) {
        body.is_default = true;
      }

      if (body.is_default) {
        await BundleStatusesModel.updateMany(
          { is_default: true },
          { $set: { is_default: false } },
          { session },
        );
      }

      const created = await createBundleStatusesHelperService.execute(
        body,
        session,
        DbTransactions,
        bundleStatusesErrorsMessages,
      );

      await created.populate(populateFields);

      await session.commitTransaction();

      return bundleStatusesPayload(
        "bundle_statuses_created",
        bundleStatusesResponse(created),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        bundleStatusesErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new createBundleStatusesService();
