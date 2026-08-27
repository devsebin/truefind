import { SingleResponse } from "@/utils/responses/success.response";
import { IInputIBundlesPayloadStrict } from "../payloads/bundle-payload";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toBundlesDTO } from "../dto/create-bundles.dto";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { bundlesErrorsMessages } from "../bundles.messages";
import { populateFields, bundlesPayload, throwError } from "../bundles.helper";
import createBundlesHelperService from "../helpers/operations/create-bundles.helper.service";
import { bundleResponse } from "../bundles.response";
import BundleModel from "@/database/bundles/bundles-db-model";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import findDocumentHelperService from "../../documents/helpers/validators/find-document.helper.service";
import findBundleStatusesHelperService from "../../bundle-statuses/helpers/validators/find-bundle-statuses.helper.service";
import { bundleStatusesErrorsMessages } from "../../bundle-statuses/bundle-statuses.messages";
import { DocumentErrorMessages } from "../../documents/documents.messages";

class createBundlesService {
  public async execute(
    request: Request,
    payload?: IInputIBundlesPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toBundlesDTO);

    try {
      session.startTransaction();

      // Validate Icon existence
      await findDocumentHelperService.execute(
        { _id: body.icon },
        bundlesErrorsMessages,
        {
          throwIfNotFound: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      // Validate status_id if provided
      if (body.status_id) {
        await findBundleStatusesHelperService.execute(
          { _id: body.status_id },
          bundlesErrorsMessages,
          {
            throwIfNotFound: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      const existingDuplicate = await BundleModel.findOne({
        $or: [{ code: body.code }, { name: body.name }],
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

        existingDuplicate.name = body.name;
        existingDuplicate.display_name = body.display_name;
        existingDuplicate.code = body.code;
        existingDuplicate.description = body.description;
        existingDuplicate.icon = body.icon;
        existingDuplicate.sort_order = body.sort_order;
        existingDuplicate.tags = body.tags;
        existingDuplicate.metadata = body.metadata;

        existingDuplicate.is_deleted = false;
        existingDuplicate.is_active = false;
        existingDuplicate.deleted_at = undefined;
        existingDuplicate.deleted_by = undefined;
        existingDuplicate.updated_by = request.user?._id;


        const saved = await existingDuplicate.save({ session });
        await saved.populate(populateFields);

        DbTransactions.push(
          await createDbTransaction(
            tableName.Bundles,
            apiMethods.POST,
            operationTypes.Create,
            saved.toObject(),
          ),
        );

        await session.commitTransaction();
        return bundlesPayload(
          "bundle_created",
          bundleResponse(saved),
          DbTransactions,
        );
      }

      const created = await createBundlesHelperService.execute(
        body,
        session,
        DbTransactions,
        bundlesErrorsMessages,
      );

      await created.populate(populateFields);

      await session.commitTransaction();

      return bundlesPayload(
        "bundle_created",
        bundleResponse(created),
        DbTransactions,
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

export default new createBundlesService();
