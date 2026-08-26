import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { Request } from "express";
import findBundleUserMappingStatusHelperService from "../helpers/validators/find-bundle-user-mapping-status.helper.service";
import { populateFields, bundleUserMappingStatusPayload } from "../bundle-user-mapping-status.helper";
import { bundleUserMappingStatusErrorsMessages } from "../bundle-user-mapping-status.messages";
import updateBundleUserMappingStatusHelperService from "../helpers/operations/update-bundle-user-mapping-status.helper.service";
import { IInputIBundleUserMappingStatusPayloadStrict } from "../payloads/bundle-user-mapping-status-payload";
import { bundleUserMappingStatusResponse } from "../bundle-user-mapping-status.response";
import BundleUserMappingStatusModel from "@/database/bundle-user-mapping-status/bundle-user-mapping-status-db-model";

class updateBundleUserMappingStatusService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: Partial<IInputIBundleUserMappingStatusPayloadStrict>,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await findBundleUserMappingStatusHelperService.execute(
        { _id: id },
        bundleUserMappingStatusErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const body =
        payload ?? (request.body as Partial<IInputIBundleUserMappingStatusPayloadStrict>);

      const queryOr: any[] = [];
      if (body.title && body.title !== existing[0].title)
        queryOr.push({ title: body.title });
      if (body.label && body.label !== existing[0].label)
        queryOr.push({ label: body.label });

      if (queryOr.length > 0) {
        const existingDuplicate = await BundleUserMappingStatusModel.findOne({
          $or: queryOr,
          _id: { $ne: id },
          is_deleted: { $in: [true, false] },
        }).session(session);

        if (existingDuplicate) {
          if (!existingDuplicate.is_deleted && existingDuplicate.is_active) {
            throw new Error("already_exists");
          }

          existingDuplicate.title = body.title ?? existingDuplicate.title;
          existingDuplicate.label = body.label ?? existingDuplicate.label;
          existingDuplicate.color = body.color ?? existingDuplicate.color;
          existingDuplicate.is_default =
            body.is_default ?? existingDuplicate.is_default;

          if (existingDuplicate.is_default) {
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

          await session.commitTransaction();
          return bundleUserMappingStatusPayload(
            "bundle_user_mapping_status_updated",
            bundleUserMappingStatusResponse(saved),
            DbTransactions,
          );
        }
      }

      if (body.is_default) {
        await BundleUserMappingStatusModel.updateMany(
          { is_default: true, _id: { $ne: id } },
          { $set: { is_default: false } },
          { session },
        );
      }

      const updated = await updateBundleUserMappingStatusHelperService.execute(
        id,
        body,
        existing[0],
        session,
        DbTransactions,
        bundleUserMappingStatusErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return bundleUserMappingStatusPayload(
        "bundle_user_mapping_status_updated",
        bundleUserMappingStatusResponse(updated),
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

export default new updateBundleUserMappingStatusService();
