import { IBundleDocument } from "@/database/bundles/bundles-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../bundles.helper";
import { bundleErrorResponse } from "../../bundles.response";

class findBundlesStateHelperService {
  async isAlreadyActive(
    bundle: HydratedDocument<IBundleDocument>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (bundle.is_active) {
        const data = bundleErrorResponse(bundle);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "bundle is already active with code: {0} and id: {1}",
            data: { data },
            filler: { 0: bundle.code, 1: bundle._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking active bundle",
        errorMap,
      );
    }
  }

  async isAlreadyInactive(
    bundle: HydratedDocument<IBundleDocument>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!bundle.is_active) {
        const data = bundleErrorResponse(bundle);

        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "bundle is already inactive with code: {0} and id: {1}",
            data: { data },
            filler: { 0: bundle.code, 1: bundle._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking inactive bundle",
        errorMap,
      );
    }
  }

  async isAlreadyDeleted(
    bundle: HydratedDocument<IBundleDocument>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (bundle.is_deleted) {
        const data = bundleErrorResponse(bundle);

        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "bundle is already deleted with code: {0} and id: {1}",
            data: { data },
            filler: { 0: bundle.code, 1: bundle._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking deleted bundle",
        errorMap,
      );
    }
  }

  async isNotDeleted(
    bundle: HydratedDocument<IBundleDocument>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!bundle.is_deleted) {
        const data = bundleErrorResponse(bundle);

        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "bundle is not deleted with code: {0} and id: {1}",
            data: { data },
            filler: { 0: bundle.code, 1: bundle._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(
        error,
        "Error while checking not deleted bundle",
        errorMap,
      );
    }
  }
}

export default new findBundlesStateHelperService();
