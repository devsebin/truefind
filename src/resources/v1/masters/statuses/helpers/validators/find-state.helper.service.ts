import { IStatus } from "@/database/status/status-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../statuses.helper";
import { statusErrorResponse } from "../../statuses.response";

class findStatusStateHelperService {
  async isAlreadyActive(
    status: HydratedDocument<IStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (status.is_active) {
        const data = statusErrorResponse(status);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "status is already active with title: {0} and id: {1}",
            data: { data },
            filler: { 0: status.label, 1: status._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking active status", errorMap);
    }
  }

  async isAlreadyInactive(
    status: HydratedDocument<IStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!status.is_active) {
        const data = statusErrorResponse(status);

        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "status is already inactive with title: {0} and id: {1}",
            data: { data },
            filler: { 0: status.label, 1: status._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking inactive status", errorMap);
    }
  }

  async isAlreadyDeleted(
    status: HydratedDocument<IStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (status.is_deleted) {
        const data = statusErrorResponse(status);

        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "status is already deleted with title: {0} and id: {1}",
            data: { data },
            filler: { 0: status.label, 1: status._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted status", errorMap);
    }
  }

  async isNotDeleted(
    status: HydratedDocument<IStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!status.is_deleted) {
        const data = statusErrorResponse(status);

        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "status is not deleted with title: {0} and id: {1}",
            data: { data },
            filler: { 0: status.label, 1: status._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted status", errorMap);
    }
  }

  async isDefault(
    status: HydratedDocument<IStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (status.is_default) {
        const data = statusErrorResponse(status);

        throwError(
          "status_is_default",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "status is default with title: {0} and id: {1}",
            data: { data },
            filler: { 0: status.label, 1: status._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking default status", errorMap);
    }
  }
}

export default new findStatusStateHelperService();
