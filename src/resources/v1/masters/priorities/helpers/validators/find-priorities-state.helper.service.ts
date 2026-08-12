import IStatus from "@/database/priorities/priorities-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../priorities.helper";
import { prioritiesErrorResponse } from "../../priorities.response";

class findPrioritiesStateHelperService {
  async isAlreadyActive(
    priority: HydratedDocument<IStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (priority.is_active) {
        const data = prioritiesErrorResponse(priority);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "priority is already active with title: {0} and id: {1}",
            data: { data },
            filler: { 0: priority.title, 1: priority._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking active priority", errorMap);
    }
  }

  async isAlreadyInactive(
    priority: HydratedDocument<IStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!priority.is_active) {
        const data = prioritiesErrorResponse(priority);

        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "priority is already inactive with title: {0} and id: {1}",
            data: { data },
            filler: { 0: priority.title, 1: priority._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking inactive priority", errorMap);
    }
  }

  async isAlreadyDeleted(
    priority: HydratedDocument<IStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (priority.is_deleted) {
        const data = prioritiesErrorResponse(priority);

        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "priority is already deleted with title: {0} and id: {1}",
            data: { data },
            filler: { 0: priority.title, 1: priority._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted priority", errorMap);
    }
  }

  async isNotDeleted(
    priority: HydratedDocument<IStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!priority.is_deleted) {
        const data = prioritiesErrorResponse(priority);

        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "priority is not deleted with title: {0} and id: {1}",
            data: { data },
            filler: { 0: priority.title, 1: priority._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted priority", errorMap);
    }
  }
}

export default new findPrioritiesStateHelperService();
