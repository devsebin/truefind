import { IBundleStatus } from "@/database/bundle-statuses/bundle-statuses-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../bundle-statuses.helper";
import { bundleStatusesErrorResponse } from "../../bundle-statuses.response";

class findBundleStatusesStateHelperService {
  async isAlreadyActive(
    bundleStatus: HydratedDocument<IBundleStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (bundleStatus.is_active) {
        const data = bundleStatusesErrorResponse(bundleStatus);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "bundle status is already active with title: {0} and id: {1}",
            data: { data },
            filler: { 0: bundleStatus.title, 1: bundleStatus._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking active bundle status",
        errorMap,
      );
    }
  }

  async isAlreadyInactive(
    bundleStatus: HydratedDocument<IBundleStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!bundleStatus.is_active) {
        const data = bundleStatusesErrorResponse(bundleStatus);

        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "bundle status is already inactive with title: {0} and id: {1}",
            data: { data },
            filler: { 0: bundleStatus.title, 1: bundleStatus._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking inactive bundle status",
        errorMap,
      );
    }
  }

  async isAlreadyDeleted(
    bundleStatus: HydratedDocument<IBundleStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (bundleStatus.is_deleted) {
        const data = bundleStatusesErrorResponse(bundleStatus);

        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "bundle status is already deleted with title: {0} and id: {1}",
            data: { data },
            filler: { 0: bundleStatus.title, 1: bundleStatus._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking deleted bundle status",
        errorMap,
      );
    }
  }

  async isNotDeleted(
    bundleStatus: HydratedDocument<IBundleStatus>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!bundleStatus.is_deleted) {
        const data = bundleStatusesErrorResponse(bundleStatus);

        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message:
              "bundle status is not deleted with title: {0} and id: {1}",
            data: { data },
            filler: { 0: bundleStatus.title, 1: bundleStatus._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking not deleted bundle status",
        errorMap,
      );
    }
  }
}

export default new findBundleStatusesStateHelperService();
