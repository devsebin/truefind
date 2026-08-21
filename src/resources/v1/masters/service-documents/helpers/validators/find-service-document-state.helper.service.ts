import { IServiceDocumentRequirements } from "@/database/service-documents/service-documents-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../service-documents.helper";
import { serviceDocumentErrorResponse } from "../../service-documents.response";

class findServiceDocumentStateHelperService {
  async isAlreadyActive(
    doc: HydratedDocument<IServiceDocumentRequirements>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (doc.is_active) {
        const data = serviceDocumentErrorResponse(doc);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "service document is already active with name: {0} and id: {1}",
            data: { data },
            filler: { 0: doc.name, 1: doc._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking active service document", errorMap);
    }
  }

  async isAlreadyInactive(
    doc: HydratedDocument<IServiceDocumentRequirements>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!doc.is_active) {
        const data = serviceDocumentErrorResponse(doc);

        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "service document is already inactive with name: {0} and id: {1}",
            data: { data },
            filler: { 0: doc.name, 1: doc._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking inactive service document", errorMap);
    }
  }

  async isAlreadyDeleted(
    doc: HydratedDocument<IServiceDocumentRequirements>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (doc.is_deleted) {
        const data = serviceDocumentErrorResponse(doc);

        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "service document is already deleted with name: {0} and id: {1}",
            data: { data },
            filler: { 0: doc.name, 1: doc._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted service document", errorMap);
    }
  }

  async isNotDeleted(
    doc: HydratedDocument<IServiceDocumentRequirements>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!doc.is_deleted) {
        const data = serviceDocumentErrorResponse(doc);

        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "service document is not deleted with name: {0} and id: {1}",
            data: { data },
            filler: { 0: doc.name, 1: doc._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted service document", errorMap);
    }
  }
}

export default new findServiceDocumentStateHelperService();
