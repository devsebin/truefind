import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  returnBundleAreaConfigSuccess,
  populateFields,
} from "../bundle-area-configurations.helper";
import { bundleAreaConfigErrorsMessages } from "../bundle-area-configurations.messages";
import { bundleAreaConfigListResponse } from "../bundle-area-configurations.response";
import findBundleAreaHelperService from "../helpers/validators/find-bundle-area.helper.service";

class ListBundleAreaConfigurationService {
  public async execute(
    request: Request,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const query: any = { is_deleted: false };

      if (request.query.bundle_id) {
        query.bundle_id = new mongoose.Types.ObjectId(
          request.query.bundle_id as string,
        );
      }

      if (request.query.country_configuration_id) {
        query.country_configuration_id = new mongoose.Types.ObjectId(
          request.query.country_configuration_id as string,
        );
      }

      if (request.query.suburb_id) {
        query.suburb_id = new mongoose.Types.ObjectId(
          request.query.suburb_id as string,
        );
      }

      if (request.query.is_active !== undefined) {
        query.is_active = request.query.is_active === "true";
      }

      const configs = await findBundleAreaHelperService.execute(
        query,
        bundleAreaConfigErrorsMessages,
        {
          session,
          populate: populateFields,
        },
      );

      await session.commitTransaction();

      return returnBundleAreaConfigSuccess(
        "area_config_fetched",
        bundleAreaConfigListResponse(configs),
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(
        err.message,
        bundleAreaConfigErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new ListBundleAreaConfigurationService();
