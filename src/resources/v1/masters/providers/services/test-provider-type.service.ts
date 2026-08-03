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
import { ITestLog } from "@/database/providers/providers-db-interface";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { HandlerRegistry } from "../helpers/support/handler.registry";
import {
  smsPayloadSchema,
  whatsappPayloadSchema,
  emailPayloadSchema,
} from "../providers.validator";

class TestProviderTypeService {
  public async execute(
    provider_id: mongoose.Types.ObjectId,
    country_id: mongoose.Types.ObjectId,
    type_id: mongoose.Types.ObjectId,
    request: Request,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

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

      // Find the existing linked country in the provider
      const linkedCountry = provider.supportedCountries.find(
        (c) => c.countryId.toString() === country._id.toString(),
      );

      if (!linkedCountry) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Country is not linked to this provider",
          data: { provider_id, country_id },
          filler: { 0: country_id.toString() },
        });
        throwError("country_not_linked", response);
      }

      // Find the specific type
      const typeIndex = linkedCountry.type.findIndex(
        (t) => (t as any)._id.toString() === type_id.toString(),
      );

      if (typeIndex === -1) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Provider type with id is not found",
          data: { type_id },
          filler: { 0: type_id.toString() },
        });
        throwError("type_not_found", response);
      }

      const targetType = linkedCountry.type[typeIndex];

      // Extract stored payload data
      let testPayload = targetType.payloadSchema;

      // Validate the payloadSchema data using the corresponding Joi validators
      let validationResult;
      if (targetType.name === "SMS") {
        validationResult = smsPayloadSchema.validate(testPayload);
      } else if (targetType.name === "WHATSAPP") {
        validationResult = whatsappPayloadSchema.validate(testPayload);
      } else if (targetType.name === "EMAIL") {
        validationResult = emailPayloadSchema.validate(testPayload);
        // Map email field to to field if email is present
        testPayload = {
          to: testPayload.email || testPayload.to,
          subject: testPayload.subject,
          body: testPayload.body,
        };
      }

      if (validationResult && validationResult.error) {
        const response = ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
          message: `Stored payload schema is invalid: ${validationResult.error.message}`,
          data: validationResult.error.details,
        });
        throwError("invalid_request", response);
      }

      // Fetch and instantiate handler
      const HandlerClass = HandlerRegistry.get(
        provider.name,
        country.iso_code,
        targetType.name as any,
      );
      const handlerInstance = new HandlerClass(linkedCountry.config);

      // Execute message testing
      let testResult;
      try {
        testResult = await handlerInstance.sendMessage(testPayload);
      } catch (testError: any) {
        testResult = {
          success: false,
          message: testError.message || "Unknown testing handler error",
        };
      }

      // Log test result
      const newTestLog: ITestLog = {
        date: new Date(),
        result: testResult.success ? "pass" : "fail",
        details: testResult.message,
      };

      if (!targetType.test_log) {
        targetType.test_log = [];
      }
      targetType.test_log.push(newTestLog);

      if (testResult.success) {
        targetType.is_tested = true;
        targetType.is_active = true;
      }

      // If all type configuration under this country is successfully tested, update country-level is_tested
      const allTypesTested = linkedCountry.type.every((t) => t.is_tested);
      if (allTypesTested) {
        linkedCountry.is_tested = true;
      }

      // Save provider changes
      const savedProvider = await provider.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.Providers,
          apiMethods.PUT,
          operationTypes.Update,
          savedProvider,
          ["supportedCountries"],
        ),
      );

      // Keep country providers list in sync
      const countryProvider = country.providers?.find(
        (p) => p.provider_id.toString() === provider._id.toString(),
      );
      if (countryProvider && testResult.success) {
        countryProvider.is_tested = true;

        // Check if there is any other provider in this country that is tested
        const hasOtherTestedProvider = country.providers?.some(
          (p) => p.provider_id.toString() !== provider._id.toString() && p.is_tested === true,
        );

        if (!hasOtherTestedProvider) {
          countryProvider.is_default = true;
        }

        await country.save({ session });

        DbTransactions.push(
          await createDbTransaction(
            tableName.Countries,
            apiMethods.PUT,
            operationTypes.Update,
            country,
            ["providers"],
          ),
        );
      }

      await savedProvider.populate(populateFields);

      await session.commitTransaction();

      // Return ONLY the tested type status
      const formattedProvider = ProviderResponse([savedProvider])[0];
      const formattedCountry = formattedProvider.supported_countries.find(
        (c: any) => c.country_id.toString() === country_id.toString(),
      );
      const formattedType = formattedCountry?.types.find(
        (t: any) => t.id.toString() === type_id.toString(),
      );

      return providerPayload(
        "type_test_completed",
        {
          test_result: {
            success: testResult.success,
            message: testResult.message,
            data: testResult.data || null,
          },
          type: formattedType,
        },
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

export default new TestProviderTypeService();
