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
  throwBundleCountryConfigError,
} from "../bundle-country-configurations.helper";
import { bundleCountryConfigErrorsMessages } from "../bundle-country-configurations.messages";
import findBundleCountryHelperService from "../helpers/validators/find-bundle-country.helper.service";
import updateBundleCountryConfigurationHelperService from "../helpers/operations/update-bundle-country-configuration.helper.service";
import { bundleCountryConfigResponse } from "../bundle-country-configurations.response";

import findBundlesHelperService from "@/resources/v1/masters/bundles/helpers/validators/find-bundles.helper.service";
import findCountryHelperService from "@/resources/v1/masters/countries/helpers/validators/find-country.helper.service";
import findCurrencyHelperService from "@/resources/v1/masters/currencies/helpers/validators/find-currencies.helper.service";
import findUnitsHelperService from "@/resources/v1/masters/units/helpers/validators/find-units.helper.service";

import { bundlesErrorsMessages } from "@/resources/v1/masters/bundles/bundles.messages";
import { countryErrorsMessages } from "@/resources/v1/masters/countries/countries.messages";
import { currenciesErrorsMessages } from "@/resources/v1/masters/currencies/currencies.messages";
import { unitsErrorsMessages } from "@/resources/v1/masters/units/units.messages";

class UpdateBundleCountryConfigurationService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const configs = await findBundleCountryHelperService.execute(
        { _id: id },
        bundleCountryConfigErrorsMessages,
        {
          throwIfNotFound: true,
          session,
        },
      );

      const existing = configs[0];

      // Check bundle if provided
      if (request.body.bundle_id) {
        await findBundlesHelperService.execute(
          { _id: request.body.bundle_id, is_deleted: false } as any,
          bundlesErrorsMessages,
          {
            throwIfNotFound: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      // Check country if provided
      if (request.body.country_id) {
        await findCountryHelperService.execute(
          {
            _id: request.body.country_id,
            is_deleted: false,
            is_active: true,
          } as any,
          countryErrorsMessages,
          {
            throwIfNotFound: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      // Check currency if provided
      if (request.body.currency_id) {
        await findCurrencyHelperService.execute(
          {
            _id: request.body.currency_id,
            is_deleted: false,
            is_active: true,
          } as any,
          currenciesErrorsMessages,
          {
            throwIfNotFound: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      // Check unit if provided
      if (request.body.unit_id) {
        await findUnitsHelperService.execute(
          {
            _id: request.body.unit_id,
            is_deleted: false,
            is_active: true,
          } as any,
          unitsErrorsMessages,
          {
            throwIfNotFound: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      // Check if combination of bundle_id and country_id is unique
      const targetBundleId = request.body.bundle_id || existing.bundle_id;
      const targetCountryId = request.body.country_id || existing.country_id;

      if (request.body.bundle_id || request.body.country_id) {
        await findBundleCountryHelperService.execute(
          {
            _id: { $ne: id },
            bundle_id: targetBundleId,
            country_id: targetCountryId,
          },
          bundleCountryConfigErrorsMessages,
          {
            throwIfExists: true,
            returnDocument: false,
            session,
          },
        );
      }

      const saved =
        await updateBundleCountryConfigurationHelperService.execute(
          id,
          request.body,
          existing,
          session,
          dbTransactions,
          bundleCountryConfigErrorsMessages,
        );

      await saved.populate(populateFields);

      await session.commitTransaction();

      return returnBundleCountryConfigSuccess(
        "country_config_updated",
        bundleCountryConfigResponse(saved),
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

export default new UpdateBundleCountryConfigurationService();
