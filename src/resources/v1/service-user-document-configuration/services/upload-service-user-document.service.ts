import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  serviceUserDocConfigPayload,
  throwError,
  populateFields,
} from "../service-user-document-configuration.helper";
import { serviceUserDocConfigErrorsMessages } from "../service-user-document-configuration.messages";
import { serviceUserDocConfigResponse } from "../service-user-document-configuration.response";
import { IUploadServiceUserDocPayload } from "../payloads/service-user-document-configuration.payload";
import findServiceUserDocumentConfigurationHelperService from "../helpers/validators/find-service-user-document-configuration.helper.service";
import uploadServiceUserDocumentHelperService from "../helpers/operations/upload-service-user-document.helper.service";
import DocumentModel from "@/database/documents/documents-db-model";
import { roleTypes } from "@/utils/definitions/constants/role-types";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class UploadServiceUserDocumentService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: IUploadServiceUserDocPayload,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    const body = payload ?? (request.body as IUploadServiceUserDocPayload);

    try {
      session.startTransaction();

      // 1. Verify employee authorization
      const roleObj = (request.user as any)?.role;
      const roleIdStr =
        roleObj && typeof roleObj === "object"
          ? (roleObj._id ? roleObj._id.toString() : (roleObj.label || roleObj.name))
          : String(roleObj || "");

      const isEmployee =
        roleIdStr === roleTypes.Employee ||
        roleIdStr === "employee" ||
        roleIdStr === "64b8a1c8f1e67290bc5b4d1c" ||
        ((request.user as any)?.role?.label === roleTypes.Employee);

      if (!isEmployee) {
        const response = ResponseBuilder.error(ErrorTypes.UNAUTHORIZED, {
          message: "Forbidden: Only employees can upload documents for review",
          data: {},
        });
        throwError("employee_only", response);
      }

      // 2. Verify service user document configuration exists
      const configs =
        await findServiceUserDocumentConfigurationHelperService.execute(
          { _id: id, is_deleted: false } as any,
          serviceUserDocConfigErrorsMessages,
          {
            throwIfNotFound: true,
            returnDocument: true,
            session,
          },
        );

      const config = configs[0];

      // 3. Verify uploaded document exists
      const documentDoc = await DocumentModel.findOne({
        _id: new mongoose.Types.ObjectId(body.document_id),
        is_deleted: false,
      }).session(session);

      if (!documentDoc) {
        throwError(
          "document_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Uploaded document not found",
            data: { document_id: body.document_id },
            filler: { 0: body.document_id },
          }),
        );
      }

      const employeeId = request.user?._id
        ? new mongoose.Types.ObjectId(request.user._id.toString())
        : undefined;

      // 4. Record upload in uploads array and update status
      const updated = await uploadServiceUserDocumentHelperService.execute(
        config,
        new mongoose.Types.ObjectId(body.document_id),
        employeeId,
        session,
        DbTransactions,
        serviceUserDocConfigErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return serviceUserDocConfigPayload(
        "service_user_doc_uploaded",
        serviceUserDocConfigResponse(updated),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(
        err.message,
        serviceUserDocConfigErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new UploadServiceUserDocumentService();
