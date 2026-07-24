import { IRegion } from "@/database/regions/regions-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../regions.helper";
import { regionErrorResponse } from "../../regions.response";

class findRegionStateHelperService {
  async isAlreadyActive(
    region: HydratedDocument<IRegion>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (region.is_active) {
        const data = regionErrorResponse(region);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "region is already active with name: {0} and id: {1}",
            data: { data },
            filler: { 0: region.name, 1: region._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking active region", errorMap);
    }
  }

  async isAlreadyInactive(
    region: HydratedDocument<IRegion>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!region.is_active) {
        const data = regionErrorResponse(region);

        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "region is already inactive with name: {0} and id: {1}",
            data: { data },
            filler: { 0: region.name, 1: region._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking inactive region", errorMap);
    }
  }

  async isAlreadyDeleted(
    region: HydratedDocument<IRegion>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (region.is_deleted) {
        const data = regionErrorResponse(region);

        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "region is already deleted with name: {0} and id: {1}",
            data: { data },
            filler: { 0: region.name, 1: region._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted region", errorMap);
    }
  }

  async isNotDeleted(
    region: HydratedDocument<IRegion>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!region.is_deleted) {
        const data = regionErrorResponse(region);

        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "region is not deleted with name: {0} and id: {1}",
            data: { data },
            filler: { 0: region.name, 1: region._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted region", errorMap);
    }
  }
}

export default new findRegionStateHelperService();
