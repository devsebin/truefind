import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { returnAreaConfigSuccess, throwAreaConfigError, populateFields } from "../service-area-configurations.helper";
import { serviceAreaConfigErrorsMessages } from "../service-area-configurations.messages";
import ServiceAreaConfigurationModel from "@/database/service-area-configuration/service-area-configuration.model";
import { BaseServiceModel } from "@/database/services/services-db-model";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import { getContextUserId } from "@/utils/context/request-context";
import { toServiceAreaBulkOverrideDTO } from "../dto/service-area-configuration.dto";
import { serviceAreaConfigListResponse } from "../service-area-configurations.response";

class BulkCreateAreaOverrideService {
  public async execute(
    serviceId: mongoose.Types.ObjectId,
    suburbIds: string[],
    overrides: any
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const dto = toServiceAreaBulkOverrideDTO(serviceId, { suburb_ids: suburbIds, overrides });

    try {
      session.startTransaction();

      const serviceExists = await BaseServiceModel.findOne({
        _id: dto.service_id,
        is_deleted: false,
      }).session(session);

      if (!serviceExists) {
        throwAreaConfigError(
          "category_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: `Service not found with id ${dto.service_id}`,
            data: { serviceId: dto.service_id },
          })
        );
      }

      const userIdStr = getContextUserId();
      const userId = userIdStr ? new mongoose.Types.ObjectId(userIdStr) : undefined;

      const ops = dto.suburb_ids.map((suburbId: mongoose.Types.ObjectId) => {
        const updateFields: any = {
          service_id: dto.service_id,
          suburb_id: suburbId,
          is_deleted: false,
          is_active: dto.overrides.is_active ?? true,
          ...dto.overrides,
        };

        if (userId) {
          updateFields.updated_by = userId;
        }

        const updateDoc: any = {
          $set: updateFields,
        };

        if (userId) {
          updateDoc.$setOnInsert = {
            created_by: userId,
          };
        }

        return {
          updateOne: {
            filter: { service_id: dto.service_id, suburb_id: suburbId },
            update: updateDoc,
            upsert: true,
          },
        };
      });

      const writeResult = await ServiceAreaConfigurationModel.bulkWrite(ops, { session });

      const updatedRecords = await ServiceAreaConfigurationModel.find({
        service_id: dto.service_id,
        suburb_id: { $in: dto.suburb_ids },
      })
        .populate(populateFields)
        .session(session);

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceAreaConfigurations,
          apiMethods.POST,
          operationTypes.Create,
          {
            writeResult,
            updatedRecords,
          }
        )
      );

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
