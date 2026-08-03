import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { providerErrorsMessages } from "../providers.messages";
import { populateFields, providerPayload, throwError } from "../providers.helper";
import { ProviderResponse } from "../providers.response";
import findProviderHelperService from "../helpers/validators/find-provider.helper.service";
import findCountryHelperService from "@/resources/v1/masters/countries/helpers/validators/find-country.helper.service";
import { countryErrorsMessages } from "@/resources/v1/masters/countries/countries.messages";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { validateSupportedCountries } from "../helpers/support/validate-supporting-country-payload.helper";
import { ISupportedCountry } from "@/database/providers/providers-db-interface";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class LinkCountryService {
  public async execute(
    provider_id: mongoose.Types.ObjectId,
    country_id: mongoose.Types.ObjectId,
    request: Request,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = request.body;

    try {
      session.startTransaction();

      // Fetch provider
      const providers = await findProviderHelperService.execute(
        {
          _id: provider_id,
          is_deleted: { $in: [true, false] },
        },
        providerErrorsMessages,
        {
          throwIfNotFound: true,
          session,
        },
      );
      const provider = providers[0];

      if (!provider.is_active) {
        const response = ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
          message: "Provider is inactive",
          data: { id: provider_id },
          filler: { 0: provider_id.toString() },
        });
        throwError("provider_inactive", response);
      }

      // Fetch country
      const countries = await findCountryHelperService.execute(
        {
          _id: country_id,
          is_deleted: { $in: [true, false] },
        },
        countryErrorsMessages,
        {
          throwIfNotFound: true,
          session,
        },
      );
      const country = countries[0];

      if (!country.is_active) {
        const response = ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
          message: "Country is inactive",
          data: { id: country_id },
          filler: { 0: country_id.toString() },
        });
        throwError("country_inactive", response);
      }

      // Check if already linked
      const providerAlreadyLinked = provider.supportedCountries.some(
        (c) => c.countryId.toString() === country._id.toString(),
      );
      const countryAlreadyLinked = country.providers?.some(
        (p) => p.provider_id.toString() === provider._id.toString(),
      );

      if (providerAlreadyLinked || countryAlreadyLinked) {
        const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
          message: "Country is already linked to this provider",
          data: { provider_id, country_id },
          filler: { 0: country_id.toString() },
        });
        throwError("country_already_linked", response);
      }

      // Build supporting country record
      const newSupportedCountry: ISupportedCountry = {
        countryId: country._id as any,
        countryCode: country.iso_code,
        config: body.config,
        type: body.type.map((t: any) => {
          const isTested = t.is_tested ?? false;
          return {
            ...t,
            is_active: isTested,
            is_tested: isTested,
            test_log: [],
          };
        }),
        supportFrom: body.supportFrom ? new Date(body.supportFrom) : new Date(),
        supportUntil: body.supportUntil ? new Date(body.supportUntil) : undefined,
        is_active: true,
        is_tested: false,
      };

      // Validate duplicate type definitions, defaults etc.
      validateSupportedCountries([newSupportedCountry]);

      // Push and save provider changes
      provider.supportedCountries.push(newSupportedCountry);
      const savedProvider = await provider.save({ session });

      if (!country.providers) {
        country.providers = [];
      }

      // Determine default status on country providers list (first linked is default, subsequent are not)
      const isFirstProvider = country.providers.length === 0;

      country.providers.push({
        provider_id: provider._id as any,
        is_default: isFirstProvider,
        is_tested: false,
      });

      const savedCountry = await country.save({ session });

      // Log transactions
      DbTransactions.push(
        await createDbTransaction(
          tableName.Providers,
          apiMethods.PUT,
          operationTypes.Update,
          savedProvider,
          ["supportedCountries"],
        ),
      );

      DbTransactions.push(
        await createDbTransaction(
          tableName.Countries,
          apiMethods.PUT,
          operationTypes.Update,
          savedCountry,
          ["providers"],
        ),
      );

      await savedProvider.populate(populateFields);

      await session.commitTransaction();

      const formattedProvider = ProviderResponse([savedProvider])[0];
      const targetCountry = formattedProvider.supported_countries.find(
        (c: any) => c.country_id.toString() === country_id.toString(),
      );

      return providerPayload(
        "country_linked",
        targetCountry,
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, providerErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new LinkCountryService();
