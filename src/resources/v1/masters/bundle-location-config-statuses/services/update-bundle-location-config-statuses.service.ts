import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { Request } from "express";
import findBundleLocationConfigStatusesHelperService from "../helpers/validators/find-bundle-location-config-statuses.helper.service";
import {
  populateFields,
  bundleLocationConfigStatusesPayload,
  throwError,
} from "../bundle-location-config-statuses.helper";
import { bundleLocationConfigStatusesErrorsMessages } from "../bundle-location-config-statuses.messages";
import updateBundleLocationConfigStatusesHelperService from "../helpers/operations/update-bundle-location-config-statuses.helper.service";
import { IInputIBundleLocationConfigStatusesPayloadStrict } from "../payloads/bundle-location-config-statuses-payload";
import { bundleLocationConfigStatusesResponse } from "../bundle-location-config-statuses.response";
import BundleLocationConfigStatusesModel from "@/database/bundle-location-config-status/bundle-location-config-status-db-model";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class updateBundleLocationConfigStatusesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: Partial<IInputIBundleLocationConfigStatusesPayloadStrict>,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing =
        await findBundleLocationConfigStatusesHelperService.execute(
          { _id: id },
          bundleLocationConfigStatusesErrorsMessages,
          {
            throwIfNotFound: true,
            lean: false,
            returnDocument: true,
            session,
          },
        );

      const body =
        payload ??
        (request.body as Partial<IInputIBundleLocationConfigStatusesPayloadStrict>);

      const queryOr: any[] = [];
      if (body.title && body.title !== existing[0].title)
        queryOr.push({ title: body.title });
      if (body.label && body.label !== existing[0].label)
        queryOr.push({ label: body.label });

      if (queryOr.length > 0) {
        const existingDuplicate =
          await BundleLocationConfigStatusesModel.findOne({
            $or: queryOr,
            _id: { $ne: id },
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

          existingDuplicate.title = body.title ?? existingDuplicate.title;
          existingDuplicate.label = body.label ?? existingDuplicate.label;
          existingDuplicate.color = body.color ?? existingDuplicate.color;
          existingDuplicate.is_default =
            body.is_default ?? existingDuplicate.is_default;

          if (existingDuplicate.is_default) {
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

          await session.commitTransaction();
          return bundleLocationConfigStatusesPayload(
            "bundle_location_config_statuses_updated",
            bundleLocationConfigStatusesResponse(saved),
            DbTransactions,
          );
        }
      }

      if (body.is_default) {
        await BundleLocationConfigStatusesModel.updateMany(
          { is_default: true, _id: { $ne: id } },
          { $set: { is_default: false } },
          { session },
        );
      }

      const updated =
        await updateBundleLocationConfigStatusesHelperService.execute(
          id,
          body,
          existing[0],
          session,
          DbTransactions,
          bundleLocationConfigStatusesErrorsMessages,
        );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return bundleLocationConfigStatusesPayload(
        "bundle_location_config_statuses_updated",
        bundleLocationConfigStatusesResponse(updated),
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

export default new updateBundleLocationConfigStatusesService();
