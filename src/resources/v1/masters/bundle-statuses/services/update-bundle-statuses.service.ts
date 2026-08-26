import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { Request } from "express";
import findBundleStatusesHelperService from "../helpers/validators/find-bundle-statuses.helper.service";
import { populateFields, bundleStatusesPayload } from "../bundle-statuses.helper";
import { bundleStatusesErrorsMessages } from "../bundle-statuses.messages";
import updateBundleStatusesHelperService from "../helpers/operations/update-bundle-statuses.helper.service";
import { IInputIBundleStatusesPayloadStrict } from "../payloads/bundle-statuses-payload";
import { bundleStatusesResponse } from "../bundle-statuses.response";
import BundleStatusesModel from "@/database/bundle-statuses/bundle-statuses-db-model";

class updateBundleStatusesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: Partial<IInputIBundleStatusesPayloadStrict>,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await findBundleStatusesHelperService.execute(
        { _id: id },
        bundleStatusesErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const body =
        payload ?? (request.body as Partial<IInputIBundleStatusesPayloadStrict>);

      const queryOr: any[] = [];
      if (body.title && body.title !== existing[0].title)
        queryOr.push({ title: body.title });
      if (body.label && body.label !== existing[0].label)
        queryOr.push({ label: body.label });

      if (queryOr.length > 0) {
        const existingDuplicate = await BundleStatusesModel.findOne({
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

          await session.commitTransaction();
          return bundleStatusesPayload(
            "bundle_statuses_updated",
            bundleStatusesResponse(saved),
            DbTransactions,
          );
        }
      }

      if (body.is_default) {
        await BundleStatusesModel.updateMany(
          { is_default: true, _id: { $ne: id } },
          { $set: { is_default: false } },
          { session },
        );
      }

      const updated = await updateBundleStatusesHelperService.execute(
        id,
        body,
        existing[0],
        session,
        DbTransactions,
        bundleStatusesErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return bundleStatusesPayload(
        "bundle_statuses_updated",
        bundleStatusesResponse(updated),
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

export default new updateBundleStatusesService();
