import { IServiceUserDocumentConfiguration } from "@/database/service-user-document-configuration/service-user-document-configuration-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../service-user-document-configuration.helper";
import { serviceUserDocConfigErrorResponse } from "../../service-user-document-configuration.response";

class FindServiceUserDocumentConfigurationStateHelperService {
  async isAlreadyActive(
    doc: HydratedDocument<IServiceUserDocumentConfiguration>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (doc.is_active) {
        const data = serviceUserDocConfigErrorResponse(doc);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service user document configuration is already active",
            data: { data },
            filler: { 0: doc._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking active service user document configuration",
        errorMap,
      );
    }
  }

  async isAlreadyInactive(
    doc: HydratedDocument<IServiceUserDocumentConfiguration>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!doc.is_active) {
        const data = serviceUserDocConfigErrorResponse(doc);
        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service user document configuration is already inactive",
            data: { data },
            filler: { 0: doc._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking inactive service user document configuration",
        errorMap,
      );
    }
  }

  async isAlreadyDeleted(
    doc: HydratedDocument<IServiceUserDocumentConfiguration>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (doc.is_deleted) {
        const data = serviceUserDocConfigErrorResponse(doc);
        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service user document configuration is already deleted",
            data: { data },
            filler: { 0: doc._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking deleted service user document configuration",
        errorMap,
      );
    }
  }

  async isNotDeleted(
    doc: HydratedDocument<IServiceUserDocumentConfiguration>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!doc.is_deleted) {
        const data = serviceUserDocConfigErrorResponse(doc);
        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service user document configuration is not deleted",
            data: { data },
            filler: { 0: doc._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking not deleted service user document configuration",
        errorMap,
      );
    }
  }
}

export default new FindServiceUserDocumentConfigurationStateHelperService();
