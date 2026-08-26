import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { Request } from "express";
import findBundlesHelperService from "../helpers/validators/find-bundles.helper.service";
import { populateFields, bundlesPayload, throwError } from "../bundles.helper";
import { bundlesErrorsMessages } from "../bundles.messages";
import updateBundlesHelperService from "../helpers/operations/update-bundles.helper.service";
import { IInputIBundlesPayloadStrict } from "../payloads/bundle-payload";
import { bundleResponse } from "../bundles.response";
import BundleModel from "@/database/bundles/bundles-db-model";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import findDocumentHelperService from "../../documents/helpers/validators/find-document.helper.service";
import findBundleStatusesHelperService from "../../bundle-statuses/helpers/validators/find-bundle-statuses.helper.service";
import { bundleStatusesErrorsMessages } from "../../bundle-statuses/bundle-statuses.messages";
import { DocumentErrorMessages } from "../../documents/documents.messages";

class updateBundlesService {
  constructor() {}

  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: Partial<IInputIBundlesPayloadStrict>,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const existing = await findBundlesHelperService.execute(
        { _id: id },
        bundlesErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const body =
        payload ?? (request.body as Partial<IInputIBundlesPayloadStrict>);

      if (body.icon) {
        await findDocumentHelperService.execute(
          { _id: new mongoose.Types.ObjectId(body.icon) },
          DocumentErrorMessages,
          {
            throwIfNotFound: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      if (body.status_id) {
        await findBundleStatusesHelperService.execute(
          { _id: new mongoose.Types.ObjectId(body.status_id) },
          bundleStatusesErrorsMessages,
          {
            throwIfNotFound: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      const queryOr: any[] = [];
      if (body.code && body.code.toUpperCase() !== existing[0].code)
        queryOr.push({ code: body.code.trim().toUpperCase() });
      if (body.name && body.name !== existing[0].name)
        queryOr.push({ name: body.name.trim() });

      if (queryOr.length > 0) {
        const existingDuplicate = await BundleModel.findOne({
          $or: queryOr,
          _id: { $ne: id },
          is_deleted: { $in: [true, false] },
        }).session(session);

        if (existingDuplicate) {
          if (!existingDuplicate.is_deleted && existingDuplicate.is_active) {
            const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
              message: "bundle already exists",
              data: body,
              filler: { 0: existingDuplicate.code },
            });
            throwError("already_exists", response);
          }

          existingDuplicate.name = `${existingDuplicate.name}_deleted_${Date.now()}`;
          existingDuplicate.code = `${existingDuplicate.code}_DELETED_${Date.now()}`;
          await existingDuplicate.save({ session });
        }
      }

      const formattedPayload: any = { ...body };
      if (body.code) formattedPayload.code = body.code.trim().toUpperCase();
      if (body.name) formattedPayload.name = body.name.trim();
      if (body.display_name) formattedPayload.display_name = body.display_name.trim();

      const updated = await updateBundlesHelperService.execute(
        id,
        formattedPayload,
        existing[0],
        session,
        dbTransactions,
        bundlesErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return bundlesPayload(
        "bundle_updated",
        bundleResponse(updated),
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        bundlesErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new updateBundlesService();
