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
  throwBundleAreaConfigError,
  populateFields,
} from "../bundle-area-configurations.helper";
import { bundleAreaConfigErrorsMessages } from "../bundle-area-configurations.messages";
import { bundleAreaConfigListResponse } from "../bundle-area-configurations.response";
import { toCreateBundleAreaConfigurationDTO } from "../dto/bundle-area-configuration.dto";
import createBundleAreaHelperService from "../helpers/operations/create-bundle-area.helper.service";
import findBundleCountryHelperService from "@/resources/v1/bundle-country-configurations/helpers/validators/find-bundle-country.helper.service";
import { bundleCountryConfigErrorsMessages } from "@/resources/v1/bundle-country-configurations/bundle-country-configurations.messages";
import findSuburbHelperService from "@/resources/v1/masters/suburbs/helpers/validators/find-suburb.helper.service";
import { suburbErrorsMessages } from "@/resources/v1/masters/suburbs/suburbs.messages";
import { getContextUserId } from "@/utils/context/request-context";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import { getActiveBundleLocationStatusId } from "@/utils/plugins/bundle-location-config-status.plugin";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";

class CreateBundleAreaConfigurationService {
  public async execute(
    request: Request,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = toCreateBundleAreaConfigurationDTO(request.body);

    try {
      session.startTransaction();

      // 1. Check for duplicate suburb_ids in the payload
      const suburbIdStrings = body.suburb_ids.map((id) => id.toString());
      const uniqueSuburbIdStrings = Array.from(new Set(suburbIdStrings));
      if (suburbIdStrings.length !== uniqueSuburbIdStrings.length) {
        const duplicates = suburbIdStrings.filter(
          (item, index) => suburbIdStrings.indexOf(item) !== index,
        );
        throwBundleAreaConfigError(
          "duplicate_suburbs_in_payload",
          ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
            message: "Duplicate suburb_id found in the payload",
            data: { duplicate_suburb_ids: Array.from(new Set(duplicates)) },
          }),
        );
      }

      // 2. Validate country_configuration_id exists
      const countryConfigs = await findBundleCountryHelperService.execute(
        { _id: body.country_configuration_id, is_deleted: false } as any,
        bundleCountryConfigErrorsMessages,
        {
          throwIfNotFound: true,
          session,
        },
      );

      const countryConfig = countryConfigs[0];
      const targetCountryId = countryConfig.country_id.toString();

      // 3. Validate suburbs exist and belong to the country
      const suburbDocs = await findSuburbHelperService.execute(
        {
          _id: { $in: body.suburb_ids },
          is_deleted: false,
          is_active: true,
        } as any,
        suburbErrorsMessages,
        {
          lean: true,
          session,
        },
      );

      if (suburbDocs.length !== body.suburb_ids.length) {
        const foundIds = suburbDocs.map((d) => d._id.toString());
        const missingIds = suburbIdStrings.filter(
          (id) => !foundIds.includes(id),
        );
        throwBundleAreaConfigError(
          "suburb_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Some suburbs were not found or are inactive",
            data: { missing_suburb_ids: missingIds },
          }),
        );
      }

      // Check whether each suburb belongs to the country_id in the country_configuration document
      const invalidSuburbs = suburbDocs.filter(
        (suburb) => suburb.country_id.toString() !== targetCountryId,
      );

      if (invalidSuburbs.length > 0) {
        const invalidSuburbIds = invalidSuburbs.map((s) => s._id.toString());
        throwBundleAreaConfigError(
          "suburbs_not_belong_to_country",
          ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
            message:
              "Some suburbs do not belong to the country of the country configuration",
            data: { invalid_suburb_ids: invalidSuburbIds },
          }),
        );
      }

      // 4. Upsert/Create bundle area configurations
      const userIdStr = getContextUserId();
      const userId = userIdStr
        ? new mongoose.Types.ObjectId(userIdStr)
        : undefined;

      const updatedRecords = await createBundleAreaHelperService.execute(
        countryConfig,
        body.suburb_ids,
        userId,
        session,
        dbTransactions,
        bundleAreaConfigErrorsMessages,
      );

      // 5. Change the status_id of the bundle_country document into active
      const activeStatusId = await getActiveBundleLocationStatusId();
      countryConfig.status_id = activeStatusId;
      if (userId) {
        countryConfig.updated_by = userId;
      }
      await countryConfig.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.BundleCountryConfigurations,
          apiMethods.PATCH,
          operationTypes.Update,
          countryConfig.toObject(),
        ),
      );

      // Populate response
      for (const rec of updatedRecords) {
        await rec.populate(populateFields);
      }

      await session.commitTransaction();

      return returnBundleAreaConfigSuccess(
        "area_config_created",
        bundleAreaConfigListResponse(updatedRecords),
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

export default new CreateBundleAreaConfigurationService();
