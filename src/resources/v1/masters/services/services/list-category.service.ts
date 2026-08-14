import {
  IBaseServiceDocument,
  ICategoryDocument,
} from "@/database/services/services-db-interface";
import {
  BaseServiceModel,
  CategoryServiceModel,
} from "@/database/services/services-db-model";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { tableName } from "@/utils/definitions/constants/table-names";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
  rethrowIfKnown,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import { Request } from "express";
import mongoose, { Model } from "mongoose";
import { returnServiceSuccess, throwError } from "../services.helper";
import { servicesErrorsMessages } from "../services.messages";
import {
  deepPopulate,
  WithChildren,
} from "@/utils/helpers/service-deep-look.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { IServiceAreaBulkOverrideDTO } from "../../service-area-configurations/dto/service-area-configuration.dto";

interface CategoryQuery {
  show_inactive_categories: boolean;
  show_inactive_subcategories: boolean;
  show_inactive_services: boolean;
  remove_empty_categories: boolean;
  remove_empty_sub_category: boolean;
}
class listServiceCategoryService {
  private categoryServiceModel: Model<ICategoryDocument>;
  private baseServiceModel: Model<IBaseServiceDocument>;
  private readonly serviceLocationRepository = Model<IServiceAreaBulkOverrideDTO>;

  constructor() {
    this.categoryServiceModel = CategoryServiceModel;
    this.baseServiceModel = BaseServiceModel;
  }

  async execute(req: Request): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const is_admin = req.user.role === "admin";
    let {
      show_inactive_categories,
      show_inactive_subcategories,
      show_inactive_services,
      remove_empty_categories,
      remove_empty_sub_category,
    } = req.query as unknown as CategoryQuery;

    try {
      session.startTransaction();
      let user_selected_service_ids: Set<string> | undefined = undefined;
      let location_active_service_ids: Set<string> | undefined = undefined;
      // Active services
      const activeServices = await this.findActiveServices(session);

      location_active_service_ids = new Set(
        activeServices.map((id: any) => id.toString()),
      );

      // User selected services

      if (!is_admin) {
        const userServices = await this.findActiveServices(session);

        user_selected_service_ids = new Set(
          userServices.map((id: any) => id.toString()),
        );
      }

      // Fetch categories
      const rootDocs = await this.findRootCategories(
        is_admin,
        session,
        location_active_service_ids,
        show_inactive_categories,
        show_inactive_subcategories,
        show_inactive_services,
        remove_empty_categories,
        remove_empty_sub_category,
        user_selected_service_ids,
      );

      DbTransactions.push(
        await createDbTransaction(
          tableName.Services,
          apiMethods.GET,
          operationTypes.Read,
          rootDocs,
        ),
      );

      await session.commitTransaction();

      return returnServiceSuccess("category_fetched", rootDocs, DbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, servicesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }

  /*------------------------ Private Methods -----------------*/

  private async findActiveServices(session: mongoose.ClientSession) {
    try {
      const services = await this.serviceLocationRepository
        .find({
          is_active: true,
        })
        .distinct("service_id")
        .session(session);

      return services;
    } catch (err) {
      rethrowIfKnown(
        err,
        "Error while finding active services",
        servicesErrorsMessages,
      );
    }
  }

  private async findRootCategories(
    is_admin: boolean = false,
    session: mongoose.ClientSession,
    location_active_service_ids: Set<string>,
    show_inactive_categories: boolean = true,
    show_inactive_subcategories: boolean = true,
    show_inactive_services: boolean = true,
    remove_empty_categories: boolean = true,
    remove_empty_sub_category: boolean = true,
    user_selected_service_ids?: Set<string>,
  ): Promise<WithChildren[]> {
    const rootQuery: any = { type: serviceTypes.Category };
    if (!show_inactive_categories) {
      rootQuery.is_active = true;
      rootQuery.is_deleted = false;
    }

    const rootDocs = (await this.categoryServiceModel
      .find(rootQuery)
      .populate("icon")
      .session(session)
      .lean()) as WithChildren[];

    if (!rootDocs || rootDocs.length === 0) {
      throwError(
        "no_root_categories_found",
        ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "No root categories found",
        }),
      );
    }

    return await deepPopulate(
      rootDocs,
      this.baseServiceModel,
      session,
      location_active_service_ids,
      show_inactive_subcategories,
      show_inactive_services,
      remove_empty_categories,
      remove_empty_sub_category,
      user_selected_service_ids,
      is_admin,
    );
  }
}
export default new listServiceCategoryService();
