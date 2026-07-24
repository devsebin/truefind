import IDistrict from "@/database/districts/districts-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../districts.helper";
import { districtErrorResponse } from "../../districts.response";

class findDistrictStateHelperService {
  async isAlreadyActive(
    district: HydratedDocument<IDistrict>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (district.is_active) {
        const data = districtErrorResponse(district);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "district is already active with name: {0} and id: {1}",
            data: { data },
            filler: { 0: district.name, 1: district._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking active district", errorMap);
    }
  }

  async isAlreadyInactive(
    district: HydratedDocument<IDistrict>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!district.is_active) {
        const data = districtErrorResponse(district);

        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "district is already inactive with name: {0} and id: {1}",
            data: { data },
            filler: { 0: district.name, 1: district._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking inactive district", errorMap);
    }
  }

  async isAlreadyDeleted(
    district: HydratedDocument<IDistrict>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (district.is_deleted) {
        const data = districtErrorResponse(district);

        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "district is already deleted with name: {0} and id: {1}",
            data: { data },
            filler: { 0: district.name, 1: district._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted district", errorMap);
    }
  }

  async isNotDeleted(
    district: HydratedDocument<IDistrict>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!district.is_deleted) {
        const data = districtErrorResponse(district);

        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "district is not deleted with name: {0} and id: {1}",
            data: { data },
            filler: { 0: district.name, 1: district._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted district", errorMap);
    }
  }
}

export default new findDistrictStateHelperService();
