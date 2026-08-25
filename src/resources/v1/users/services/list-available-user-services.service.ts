import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { usersErrorsMessages } from "../users.messages";
import { userPayload, throwError } from "../users.helper";
import UserModel from "@/database/users/users-db-model";
import SuburbModel from "@/database/suburbs/suburbs-db-model";
import ServiceAreaConfigurationModel from "@/database/service-area-configuration/service-area-configuration.model";
import { BaseServiceModel } from "@/database/services/services-db-model";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class ListAvailableUserServicesService {
  public async execute(
    userId: string,
    request: Request,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      // 1. Get authenticated user
      const user = await UserModel.findById(userId)
        .select("region_id suburb_id")
        .session(session)
        .lean();

      if (!user) {
        throwError(
          "user_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "User not found",
          }),
        );
      }

      let suburbIds: mongoose.Types.ObjectId[] = [];
      const isExactSuburb = !!user.suburb_id;

      if (user.suburb_id && !request.query.is_full_region) {
        suburbIds = [user.suburb_id];
      } else if (user.region_id) {
        const suburbs = await SuburbModel.find({
          region_id: user.region_id,
          is_active: true,
          is_deleted: false,
        })
          .select("_id")
          .session(session)
          .lean();

        suburbIds = suburbs.map((s) => s._id);
      }

      // If user has no suburb and no region, return empty list
      if (suburbIds.length === 0) {
        await session.commitTransaction();
        return userPayload("services_fetched", [], DbTransactions);
      }

      // 2. Query service-area configurations
      const serviceAreas = await ServiceAreaConfigurationModel.find({
        suburb_id: { $in: suburbIds },
        is_active: true,
        is_deleted: false,
      })
        .session(session)
        .lean();

      if (serviceAreas.length === 0) {
        await session.commitTransaction();
        return userPayload("services_fetched", [], DbTransactions);
      }

      const availableServiceIds = new Set(
        serviceAreas.map((item) => item.service_id.toString())
      );

      // Build a map of service configurations for quick lookup
      // Note: For exact suburb, we use the specific config.
      const serviceAreaMap = new Map<string, any>();
      for (const sa of serviceAreas) {
        serviceAreaMap.set(sa.service_id.toString(), sa);
      }

      // 3. Query all active, non-deleted categories, subcategories, and services
      const services = await BaseServiceModel.find({
        is_active: true,
        is_deleted: false,
      })
        .populate("icon")
        .session(session)
        .lean() as any[];

      const serviceMap = new Map(
        services.map((s) => [s._id.toString(), s])
      );

      // 4. Recursive tree builder
      const buildServiceTree = (
        serviceId: string,
        visited = new Set<string>()
      ): any => {
        if (visited.has(serviceId)) {
          return null;
        }

        const service = serviceMap.get(serviceId);
        if (!service) {
          return null;
        }

        const nextVisited = new Set(visited);
        nextVisited.add(serviceId);

        const children = (service.children ?? [])
          .map((childId: any) =>
            buildServiceTree(childId.toString(), nextVisited)
          )
          .filter(Boolean);

        const directlyAvailable = availableServiceIds.has(serviceId);

        if (!directlyAvailable && children.length === 0) {
          return null;
        }

        // Prepare configuration object if exact suburb lookup
        let configuration: any = undefined;
        if (isExactSuburb && directlyAvailable) {
          const configDoc = serviceAreaMap.get(serviceId);
          if (configDoc) {
            configuration = {
              required_licenses: configDoc.required_licenses,
              is_callout_service: configDoc.is_callout_service,
              is_fixed_price: configDoc.is_fixed_price,
              price: configDoc.price,
              unit_id: configDoc.unit_id,
              minimum_unit_price: configDoc.minimum_unit_price,
              maximum_unit_price: configDoc.maximum_unit_price,
              call_out_fee: configDoc.call_out_fee,
              estimated_time: configDoc.estimated_time,
              estimated_time_unit: configDoc.estimated_time_unit,
              is_active: configDoc.is_active,
            };
          }
        }

        return {
          _id: service._id,
          name: service.name,
          type: service.type,
          description: service.description,
          icon: service.icon,
          estimated_time: service.estimated_time,
          estimated_time_unit: service.estimated_time_unit,
          children,
          ...(configuration ? { configuration } : {}),
        };
      };

      // 5. Root services are categories
      const rootServices = services.filter(
        (s) => s.type === serviceTypes.Category
      );

      const tree = rootServices
        .map((s) => buildServiceTree(s._id.toString()))
        .filter(Boolean);

      DbTransactions.push(
        await createDbTransaction(
          tableName.Services,
          apiMethods.GET,
          operationTypes.Read,
          tree,
        )
      );

      await session.commitTransaction();

      return userPayload("services_fetched", tree, DbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, usersErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new ListAvailableUserServicesService();
