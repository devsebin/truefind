import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { returnAreaConfigSuccess, throwAreaConfigError, populateFields } from "../service-area-configurations.helper";
import { serviceAreaConfigErrorsMessages } from "../service-area-configurations.messages";
import { getContextUserId } from "@/utils/context/request-context";
import { serviceAreaConfigListResponse } from "../service-area-configurations.response";
import createServiceAreaHelperService from "../helpers/operations/create-service-area.helper.service";

import findServiceHelperService from "@/resources/v1/masters/services/helpers/validators/find-service.helper.service";
import findSuburbHelperService from "@/resources/v1/masters/suburbs/helpers/validators/find-suburb.helper.service";
import findUnitsHelperService from "@/resources/v1/masters/units/helpers/validators/find-units.helper.service";

import { suburbErrorsMessages } from "@/resources/v1/masters/suburbs/suburbs.messages";
import { unitsErrorsMessages } from "@/resources/v1/masters/units/units.messages";

import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import { serviceTypes } from "@/utils/definitions/constants/service-types";

class BulkCreateAreaOverrideService {
  public async execute(
    serviceId: mongoose.Types.ObjectId,
    suburbs: any[]
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // 1. Validate service
      const service = await findServiceHelperService.findOne(
        { _id: serviceId, is_deleted: false },
        session
      );
      if (!service) {
        throwAreaConfigError(
          "service_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Service not found",
            data: { service_id: serviceId },
          })
        );
      }
      if (service.type !== serviceTypes.Service) {
        throwAreaConfigError(
          "invalid_service_type",
          ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
            message: "Service type must be 'service'",
            data: { service_id: serviceId },
          })
        );
      }

      // Check for duplicate suburb_ids in the payload
      const payloadSuburbIds = suburbs.map((s: any) => s.suburb_id);
      const uniqueSuburbIds = Array.from(new Set(payloadSuburbIds));
      if (payloadSuburbIds.length !== uniqueSuburbIds.length) {
        const duplicates = payloadSuburbIds.filter((item, index) => payloadSuburbIds.indexOf(item) !== index);
        throwAreaConfigError(
          "duplicate_suburbs_in_payload",
          ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
            message: "Duplicate suburb_id found in the payload",
            data: { duplicate_suburb_ids: Array.from(new Set(duplicates)) },
          })
        );
      }

      // 2. Validate all suburbs and units in the payload in bulk
      const suburbIds = uniqueSuburbIds;
      const unitIds = Array.from(new Set(suburbs.map((s: any) => s.unit_id)));

      // 2.1 Suburbs
      const suburbDocs = await findSuburbHelperService.execute(
        { _id: { $in: suburbIds }, is_deleted: false, is_active: true } as any,
        suburbErrorsMessages,
        {
          lean: true,
          session,
        }
      );
      if (suburbDocs.length !== suburbIds.length) {
        const foundIds = suburbDocs.map(d => d._id.toString());
        const missingIds = suburbIds.filter(id => !foundIds.includes(id));
        throwAreaConfigError(
          "suburb_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Some suburbs were not found or are inactive",
            data: { missing_suburb_ids: missingIds },
          })
        );
      }

      // 2.2 Units
      const unitDocs = await findUnitsHelperService.execute(
        { _id: { $in: unitIds }, is_deleted: false, is_active: true } as any,
        unitsErrorsMessages,
        {
          lean: true,
          session,
        }
      );
      if (unitDocs.length !== unitIds.length) {
        const foundIds = unitDocs.map(d => d._id.toString());
        const missingIds = unitIds.filter(id => !foundIds.includes(id));
        throwAreaConfigError(
          "units_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Some units were not found or are inactive",
            data: { missing_unit_ids: missingIds },
          })
        );
      }

      // 3. Upsert service area configurations
      const userIdStr = getContextUserId();
      const userId = userIdStr ? new mongoose.Types.ObjectId(userIdStr) : undefined;

      const updatedRecords = await createServiceAreaHelperService.execute(
        serviceId,
        suburbs,
        userId,
        session,
        dbTransactions,
        serviceAreaConfigErrorsMessages
      );

      // Populate populated fields
      for (const rec of updatedRecords) {
        await rec.populate(populateFields);
      }

      await session.commitTransaction();

      return returnAreaConfigSuccess(
        "area_config_created",
        serviceAreaConfigListResponse(updatedRecords),
        dbTransactions
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceAreaConfigErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new BulkCreateAreaOverrideService();
