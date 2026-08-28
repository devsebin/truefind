import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  returnBundleCountryConfigSuccess, populateFields
} from "../bundle-country-configurations.helper";
import { bundleCountryConfigErrorsMessages } from "../bundle-country-configurations.messages";
import findBundleCountryHelperService from "../helpers/validators/find-bundle-country.helper.service";
import createBundleCountryConfigurationHelperService from "../helpers/operations/create-bundle-country-configuration.helper.service";
import { toBundleCountryConfigurationDTO } from "../dto/bundle-country-configuration.dto";
import { bundleCountryConfigResponse } from "../bundle-country-configurations.response";

import findBundlesHelperService from "@/resources/v1/masters/bundles/helpers/validators/find-bundles.helper.service";
import findCountryHelperService from "@/resources/v1/masters/countries/helpers/validators/find-country.helper.service";
import findCurrencyHelperService from "@/resources/v1/masters/currencies/helpers/validators/find-currencies.helper.service";
import findUnitsHelperService from "@/resources/v1/masters/units/helpers/validators/find-units.helper.service";

import { bundlesErrorsMessages } from "@/resources/v1/masters/bundles/bundles.messages";
import { countryErrorsMessages } from "@/resources/v1/masters/countries/countries.messages";
import { currenciesErrorsMessages } from "@/resources/v1/masters/currencies/currencies.messages";
import { unitsErrorsMessages } from "@/resources/v1/masters/units/units.messages";


class CreateBundleCountryConfigurationService {
  public async execute(
    request: Request,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = toBundleCountryConfigurationDTO(request.body);

    try {
      session.startTransaction();

      // Check bundle exists and active
      await findBundlesHelperService.execute(
        { _id: body.bundle_id, is_deleted: false } as any,
        bundlesErrorsMessages,
        {
          throwIfNotFound: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      // Check country exists and active
      await findCountryHelperService.execute(
        { _id: body.country_id, is_deleted: false, is_active: true } as any,
        countryErrorsMessages,
        {
          throwIfNotFound: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      // Check currency exists and active
      await findCurrencyHelperService.execute(
        { _id: body.currency_id, is_deleted: false, is_active: true } as any,
        currenciesErrorsMessages,
        {
          throwIfNotFound: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      // Check unit if provided
      if (body.unit_id) {
        await findUnitsHelperService.execute(
          { _id: body.unit_id, is_deleted: false, is_active: true } as any,
          unitsErrorsMessages,
          {
            throwIfNotFound: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      // Check unique (bundle_id + country_id)
      await findBundleCountryHelperService.execute(
        {
          bundle_id: body.bundle_id,
          country_id: body.country_id,
        },
        bundleCountryConfigErrorsMessages,
        {
          throwIfExists: true,
          returnDocument: false,
          session,
        },
      );

      const newConfig =
        await createBundleCountryConfigurationHelperService.execute(
          body,
          session,
          dbTransactions,
          bundleCountryConfigErrorsMessages,
        );

      await newConfig.populate(populateFields);

      await session.commitTransaction();

      return returnBundleCountryConfigSuccess(
        "country_config_created",
        bundleCountryConfigResponse(newConfig),
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

export default new CreateBundleCountryConfigurationService();
