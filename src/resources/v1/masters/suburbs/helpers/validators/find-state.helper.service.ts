import ISuburb from "@/database/suburbs/suburbs-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../suburbs.helper";
import { suburbErrorResponse } from "../../suburbs.response";

class findSuburbStateHelperService {
  async isAlreadyActive(
    suburb: HydratedDocument<ISuburb>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (suburb.is_active) {
        const data = suburbErrorResponse(suburb);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "suburb is already active with name: {0} and id: {1}",
            data: { data },
            filler: { 0: suburb.name, 1: suburb._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking active suburb", errorMap);
    }
  }

  async isAlreadyInactive(
    suburb: HydratedDocument<ISuburb>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!suburb.is_active) {
        const data = suburbErrorResponse(suburb);

        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "suburb is already inactive with name: {0} and id: {1}",
            data: { data },
            filler: { 0: suburb.name, 1: suburb._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking inactive suburb", errorMap);
    }
  }

  async isAlreadyDeleted(
    suburb: HydratedDocument<ISuburb>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (suburb.is_deleted) {
        const data = suburbErrorResponse(suburb);

        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "suburb is already deleted with name: {0} and id: {1}",
            data: { data },
            filler: { 0: suburb.name, 1: suburb._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted suburb", errorMap);
    }
  }

  async isNotDeleted(
    suburb: HydratedDocument<ISuburb>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!suburb.is_deleted) {
        const data = suburbErrorResponse(suburb);

        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "suburb is not deleted with name: {0} and id: {1}",
            data: { data },
            filler: { 0: suburb.name, 1: suburb._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted suburb", errorMap);
    }
  }
}

export default new findSuburbStateHelperService();
