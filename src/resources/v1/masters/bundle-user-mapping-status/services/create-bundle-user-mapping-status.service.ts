import { SingleResponse } from "@/utils/responses/success.response";
import { IInputIBundleUserMappingStatusPayloadStrict } from "../payloads/bundle-user-mapping-status-payload";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toBundleUserMappingStatusDTO } from "../dto/create-bundle-user-mapping-status.dto";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { bundleUserMappingStatusErrorsMessages } from "../bundle-user-mapping-status.messages";
import { populateFields, bundleUserMappingStatusPayload } from "../bundle-user-mapping-status.helper";
import createBundleUserMappingStatusHelperService from "../helpers/operations/create-bundle-user-mapping-status.helper.service";
import { bundleUserMappingStatusResponse } from "../bundle-user-mapping-status.response";
import BundleUserMappingStatusModel from "@/database/bundle-user-mapping-status/bundle-user-mapping-status-db-model";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";

class createBundleUserMappingStatusService {
  public async execute(
    request: Request,
    payload?: IInputIBundleUserMappingStatusPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toBundleUserMappingStatusDTO);

    try {
      session.startTransaction();

      const existingDuplicate = await BundleUserMappingStatusModel.findOne({
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

        const defaultExists = await BundleUserMappingStatusModel.findOne({
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
          await BundleUserMappingStatusModel.updateMany(
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
            tableName.BundleUserMappingStatuses,
            apiMethods.POST,
            operationTypes.Create,
            saved.toObject(),
          ),
        );

        await session.commitTransaction();
        return bundleUserMappingStatusPayload(
          "bundle_user_mapping_status_created",
          bundleUserMappingStatusResponse(saved),
          DbTransactions,
        );
      }

      const defaultExists = await BundleUserMappingStatusModel.findOne({
        is_default: true,
        is_deleted: false,
        is_active: true,
      }).session(session);

      if (!defaultExists) {
        body.is_default = true;
      }

      if (body.is_default) {
        await BundleUserMappingStatusModel.updateMany(
          { is_default: true },
          { $set: { is_default: false } },
          { session },
        );
      }

      const created = await createBundleUserMappingStatusHelperService.execute(
        body,
        session,
        DbTransactions,
        bundleUserMappingStatusErrorsMessages,
      );

      await created.populate(populateFields);

      await session.commitTransaction();

      return bundleUserMappingStatusPayload(
        "bundle_user_mapping_status_created",
        bundleUserMappingStatusResponse(created),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        bundleUserMappingStatusErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new createBundleUserMappingStatusService();
