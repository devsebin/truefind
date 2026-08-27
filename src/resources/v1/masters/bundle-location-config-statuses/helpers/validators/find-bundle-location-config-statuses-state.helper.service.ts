import { IBundleLocationConfigStatus } from "@/database/bundle-location-config-status/bundle-location-config-status-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../bundle-location-config-statuses.helper";
import { bundleLocationConfigStatusesErrorResponse } from "../../bundle-location-config-statuses.response";

class findBundleLocationConfigStatusesStateHelperService {
  async isAlreadyActive(
    bundleLocationConfigStatus: HydratedDocument<IBundleLocationConfigStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (bundleLocationConfigStatus.is_active) {
        const data = bundleLocationConfigStatusesErrorResponse(
          bundleLocationConfigStatus,
        );
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "bundle location config status is already active with title: {0} and id: {1}",
            data: { data },
            filler: {
              0: bundleLocationConfigStatus.title,
              1: bundleLocationConfigStatus._id,
            },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking active bundle location config status",
        errorMap,
      );
    }
  }

  async isAlreadyInactive(
    bundleLocationConfigStatus: HydratedDocument<IBundleLocationConfigStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!bundleLocationConfigStatus.is_active) {
        const data = bundleLocationConfigStatusesErrorResponse(
          bundleLocationConfigStatus,
        );

        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "bundle location config status is already inactive with title: {0} and id: {1}",
            data: { data },
            filler: {
              0: bundleLocationConfigStatus.title,
              1: bundleLocationConfigStatus._id,
            },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking inactive bundle location config status",
        errorMap,
      );
    }
  }

  async isAlreadyDeleted(
    bundleLocationConfigStatus: HydratedDocument<IBundleLocationConfigStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (bundleLocationConfigStatus.is_deleted) {
        const data = bundleLocationConfigStatusesErrorResponse(
          bundleLocationConfigStatus,
        );

        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "bundle location config status is already deleted with title: {0} and id: {1}",
            data: { data },
            filler: {
              0: bundleLocationConfigStatus.title,
              1: bundleLocationConfigStatus._id,
            },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking deleted bundle location config status",
        errorMap,
      );
    }
  }

  async isNotDeleted(
    bundleLocationConfigStatus: HydratedDocument<IBundleLocationConfigStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!bundleLocationConfigStatus.is_deleted) {
        const data = bundleLocationConfigStatusesErrorResponse(
          bundleLocationConfigStatus,
        );

        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "bundle location config status is not deleted with title: {0} and id: {1}",
            data: { data },
            filler: {
              0: bundleLocationConfigStatus.title,
              1: bundleLocationConfigStatus._id,
            },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking not deleted bundle location config status",
        errorMap,
      );
    }
  }
}

export default new findBundleLocationConfigStatusesStateHelperService();
