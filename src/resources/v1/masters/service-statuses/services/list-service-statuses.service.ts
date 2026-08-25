import { IServiceStatus } from "@/database/service-status/service-status-db-interface";
import ServiceStatusModel from "@/database/service-status/service-status-db-model";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { tableName } from "@/utils/definitions/constants/table-names";
import { buildWhereClause } from "@/utils/helpers/build-query.helper";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { listResponse } from "@/utils/responses/success.response";
import { Request } from "express";
import { Model } from "mongoose";
import { serviceStatusesPayload, populateFields } from "../service-statuses.helper";
import { serviceStatusesListResponse } from "../service-statuses.response";
import { serviceStatusesErrorsMessages } from "../service-statuses.messages";

class listServiceStatusesService {
  private readonly serviceStatusRepository: Model<IServiceStatus>;

  constructor() {
    this.serviceStatusRepository = ServiceStatusModel;
  }

  async execute(
    request: Request,
    is_export = false,
  ): Promise<listResponse | ErrorResponse> {
    const conditions = request.query;
    conditions.populate = populateFields;
    const page = parseInt(conditions.page as string, 10) || 1;
    const limit = parseInt(conditions.limit as string, 10) || 10;
    const offset = limit * (page - 1);
    const where = await buildWhereClause(request);

    const query = this.buildQuery(where, conditions, offset);
    const DbTransactions: DbTransaction[] = [];

    try {
      const [serviceStatuses, totalCount] = await Promise.all([
        query
          .sort({
            [conditions.order_by as string || "createdAt"]:
              conditions.order_direction === "asc" ? 1 : -1,
          })
          .exec(),
        this.serviceStatusRepository.countDocuments(where),
      ]);

      DbTransactions.push(
        await createDbTransaction(
          tableName.ServiceStatus,
          apiMethods.GET,
          operationTypes.Read,
          serviceStatuses,
        ),
      );

      const data = {
        current_page: page,
        totalCount: totalCount,
        rows_per_page: limit,
        last_page: Math.ceil(totalCount / limit),
        from: 1 + offset,
        rows: serviceStatusesListResponse(serviceStatuses),
      };

      return serviceStatusesPayload(
        "service_statuses_listed",
        data,
        DbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };
      return buildErrorResult(
        err.message,
        serviceStatusesErrorsMessages,
        err.data,
      );
    }
  }

  private buildQuery(where: any, conditions: any, offset: number): any {
    const query = this.serviceStatusRepository.find(where);
    const orderBy: any = {};

    if (conditions.populate) {
      query.populate(conditions.populate);
    }

    if (conditions.order_by) {
      orderBy[conditions.order_by] =
        conditions.order_direction === "asc" ? 1 : -1;
      query.sort(orderBy);
    }

    if (conditions.fields) {
      query.select(
        conditions.fields.split(",").map((field: string) => field.trim()),
      );
    }

    if (conditions.limit) {
      query.limit(conditions.limit);
    }

    if (conditions.page) {
      query.skip(offset);
    }

    return query;
  }
}

export default new listServiceStatusesService();
