import { IServiceStatus } from "@/database/service-status/service-status-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../service-statuses.helper";
import { serviceStatusesErrorResponse } from "../../service-statuses.response";

class findServiceStatusesStateHelperService {
  async isAlreadyActive(
    serviceStatus: HydratedDocument<IServiceStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (serviceStatus.is_active) {
        const data = serviceStatusesErrorResponse(serviceStatus);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "service status is already active with title: {0} and id: {1}",
            data: { data },
            filler: { 0: serviceStatus.title, 1: serviceStatus._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking active service status",
        errorMap,
      );
    }
  }

  async isAlreadyInactive(
    serviceStatus: HydratedDocument<IServiceStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!serviceStatus.is_active) {
        const data = serviceStatusesErrorResponse(serviceStatus);

        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "service status is already inactive with title: {0} and id: {1}",
            data: { data },
            filler: { 0: serviceStatus.title, 1: serviceStatus._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking inactive service status",
        errorMap,
      );
    }
  }

  async isAlreadyDeleted(
    serviceStatus: HydratedDocument<IServiceStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (serviceStatus.is_deleted) {
        const data = serviceStatusesErrorResponse(serviceStatus);

        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "service status is already deleted with title: {0} and id: {1}",
            data: { data },
            filler: { 0: serviceStatus.title, 1: serviceStatus._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking deleted service status",
        errorMap,
      );
    }
  }

  async isNotDeleted(
    serviceStatus: HydratedDocument<IServiceStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!serviceStatus.is_deleted) {
        const data = serviceStatusesErrorResponse(serviceStatus);

        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "service status is not deleted with title: {0} and id: {1}",
            data: { data },
            filler: { 0: serviceStatus.title, 1: serviceStatus._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking deleted service status",
        errorMap,
      );
    }
  }
}

export default new findServiceStatusesStateHelperService();
