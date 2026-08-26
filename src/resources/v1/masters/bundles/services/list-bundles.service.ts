import { IBundleDocument } from "@/database/bundles/bundles-db-interface";
import BundleModel from "@/database/bundles/bundles-db-model";
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
import { bundlesPayload, populateFields } from "../bundles.helper";
import { bundleListResponse } from "../bundles.response";
import { bundlesErrorsMessages } from "../bundles.messages";

class listBundlesService {
  private readonly bundleRepository: Model<IBundleDocument>;

  constructor() {
    this.bundleRepository = BundleModel;
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
      const [bundles, totalCount] = await Promise.all([
        query
          .sort({
            [conditions.order_by as string || "createdAt"]:
              conditions.order_direction === "asc" ? 1 : -1,
          })
          .exec(),
        this.bundleRepository.countDocuments(where),
      ]);

      DbTransactions.push(
        await createDbTransaction(
          tableName.Bundles,
          apiMethods.GET,
          operationTypes.Read,
          bundles,
        ),
      );

      const response = bundleListResponse(bundles);

      return bundlesPayload(
        "bundles_listed",
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
        bundlesErrorsMessages,
        err.data,
      );
    }
  }

  private buildQuery(where: any, conditions: any, offset: number) {
    const query = this.bundleRepository
      .find(where)
      .skip(offset)
      .limit(parseInt(conditions.limit as string, 10) || 10)
      .populate(conditions.populate);

    return query;
  }
}

export default new listBundlesService();
