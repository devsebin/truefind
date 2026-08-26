import { IBundleUserMappingStatus } from "@/database/bundle-user-mapping-status/bundle-user-mapping-status-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../bundle-user-mapping-status.helper";
import { bundleUserMappingStatusErrorResponse } from "../../bundle-user-mapping-status.response";

class findBundleUserMappingStatusStateHelperService {
  async isAlreadyActive(
    bundleUserMappingStatus: HydratedDocument<IBundleUserMappingStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (bundleUserMappingStatus.is_active) {
        const data = bundleUserMappingStatusErrorResponse(bundleUserMappingStatus);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "bundle user mapping status is already active with title: {0} and id: {1}",
            data: { data },
            filler: { 0: bundleUserMappingStatus.title, 1: bundleUserMappingStatus._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking active bundle user mapping status",
        errorMap,
      );
    }
  }

  async isAlreadyInactive(
    bundleUserMappingStatus: HydratedDocument<IBundleUserMappingStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!bundleUserMappingStatus.is_active) {
        const data = bundleUserMappingStatusErrorResponse(bundleUserMappingStatus);

        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "bundle user mapping status is already inactive with title: {0} and id: {1}",
            data: { data },
            filler: { 0: bundleUserMappingStatus.title, 1: bundleUserMappingStatus._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking inactive bundle user mapping status",
        errorMap,
      );
    }
  }

  async isAlreadyDeleted(
    bundleUserMappingStatus: HydratedDocument<IBundleUserMappingStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (bundleUserMappingStatus.is_deleted) {
        const data = bundleUserMappingStatusErrorResponse(bundleUserMappingStatus);

        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "bundle user mapping status is already deleted with title: {0} and id: {1}",
            data: { data },
            filler: { 0: bundleUserMappingStatus.title, 1: bundleUserMappingStatus._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking deleted bundle user mapping status",
        errorMap,
      );
    }
  }

  async isNotDeleted(
    bundleUserMappingStatus: HydratedDocument<IBundleUserMappingStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!bundleUserMappingStatus.is_deleted) {
        const data = bundleUserMappingStatusErrorResponse(bundleUserMappingStatus);

        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "bundle user mapping status is not deleted with title: {0} and id: {1}",
            data: { data },
            filler: { 0: bundleUserMappingStatus.title, 1: bundleUserMappingStatus._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking not deleted bundle user mapping status",
        errorMap,
      );
    }
  }
}

export default new findBundleUserMappingStatusStateHelperService();
