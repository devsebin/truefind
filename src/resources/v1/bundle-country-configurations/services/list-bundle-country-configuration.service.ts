import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  returnBundleCountryConfigSuccess,
  populateFields,
} from "../bundle-country-configurations.helper";
import { bundleCountryConfigErrorsMessages } from "../bundle-country-configurations.messages";
import findBundleCountryHelperService from "../helpers/validators/find-bundle-country.helper.service";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { bundleCountryConfigListResponse } from "../bundle-country-configurations.response";

class ListBundleCountryConfigurationService {
  public async execute(
    request: Request,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const { bundle_id, country_id } = request.query;
      const query: any = {};

      if (bundle_id) {
        query.bundle_id = new mongoose.Types.ObjectId(bundle_id as string);
      }
      if (country_id) {
        query.country_id = new mongoose.Types.ObjectId(country_id as string);
      }

      const configs = await findBundleCountryHelperService.execute(
        query,
        bundleCountryConfigErrorsMessages,
        {
          populate: populateFields,
          session,
        },
      );

      dbTransactions.push(
        await createDbTransaction(
          tableName.BundleCountryConfigurations,
          apiMethods.GET,
          operationTypes.Read,
          configs,
        ),
      );

      await session.commitTransaction();

      return returnBundleCountryConfigSuccess(
        "country_config_fetched",
        bundleCountryConfigListResponse(configs),
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(
        err.message,
        bundleCountryConfigErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }
  }
}

export default new ListBundleCountryConfigurationService();
