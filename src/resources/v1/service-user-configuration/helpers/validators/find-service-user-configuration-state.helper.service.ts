import { IUserTaskMapping } from "@/database/service-user-configuration/service-user-configuration-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../service-user-configuration.helper";
import { serviceUserConfigErrorResponse } from "../../service-user-configuration.response";

class FindServiceUserConfigurationStateHelperService {
  async isAlreadyActive(
    doc: HydratedDocument<IUserTaskMapping>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (doc.is_active && !doc.is_deleted) {
        const data = serviceUserConfigErrorResponse(doc);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service user configuration is already active with id: {0}",
            data: { data },
            filler: { 0: doc._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking active state", errorMap);
    }
  }

  async isAlreadyInactive(
    doc: HydratedDocument<IUserTaskMapping>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!doc.is_active || doc.is_deleted) {
        const data = serviceUserConfigErrorResponse(doc);
        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service user configuration is already inactive with id: {0}",
            data: { data },
            filler: { 0: doc._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking inactive state", errorMap);
    }
  }

  async isAlreadyDeleted(
    doc: HydratedDocument<IUserTaskMapping>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (doc.is_deleted) {
        const data = serviceUserConfigErrorResponse(doc);
        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service user configuration is already deleted with id: {0}",
            data: { data },
            filler: { 0: doc._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted state", errorMap);
    }
  }

  async isNotDeleted(
    doc: HydratedDocument<IUserTaskMapping>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!doc.is_deleted) {
        const data = serviceUserConfigErrorResponse(doc);
        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Service user configuration is not deleted with id: {0}",
            data: { data },
            filler: { 0: doc._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted state", errorMap);
    }
  }
}

export default new FindServiceUserConfigurationStateHelperService();
