import { IBundleStatus } from "@/database/bundle-statuses/bundle-statuses-db-interface";
import BundleStatusesModel from "@/database/bundle-statuses/bundle-statuses-db-model";
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
import { bundleStatusesPayload, populateFields } from "../bundle-statuses.helper";
import { bundleStatusesListResponse } from "../bundle-statuses.response";
import { bundleStatusesErrorsMessages } from "../bundle-statuses.messages";

class listBundleStatusesService {
  private readonly bundleStatusRepository: Model<IBundleStatus>;

  constructor() {
    this.bundleStatusRepository = BundleStatusesModel;
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
      const [bundleStatuses, totalCount] = await Promise.all([
        query
          .sort({
            [conditions.order_by as string || "createdAt"]:
              conditions.order_direction === "asc" ? 1 : -1,
          })
          .exec(),
        this.bundleStatusRepository.countDocuments(where),
      ]);

      DbTransactions.push(
        await createDbTransaction(
          tableName.BundleStatuses,
          apiMethods.GET,
          operationTypes.Read,
          bundleStatuses,
        ),
      );

      const response = bundleStatusesListResponse(bundleStatuses);

      return bundleStatusesPayload(
        "bundle_statuses_listed",
        {
          items: response,
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
        DbTransactions,
      );
    } catch (error) {
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        bundleStatusesErrorsMessages,
        err.data,
      );
    }
  }

  private buildQuery(where: any, conditions: any, offset: number) {
    const query = this.bundleStatusRepository
      .find(where)
      .skip(offset)
      .limit(parseInt(conditions.limit as string, 10) || 10)
      .populate(conditions.populate);

    return query;
  }
}

export default new listBundleStatusesService();
