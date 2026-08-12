import { CategoryServiceModel } from "@/database/services/services-db-model";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import { Request } from "express";
import mongoose from "mongoose";
import { toCategoryDTO } from "../dto/create-category.dto";
import createServiceEntityHelperService from "../helpers/operations/create-service-entity.helper.service";
import findServiceHelperService from "../helpers/validators/find-service.helper.service";
import validateIconHelperService from "../helpers/validators/validate-icon.helper.service";
import { returnServiceSuccess } from "../services.helper";
import { servicesErrorsMessages } from "../services.messages";
import { serviceResponse } from "../services.response";

class createCategoryService {
  public async execute(
    request: Request,
    payload?: any,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toCategoryDTO);

    try {
      session.startTransaction();

      // Check category name duplication
      await findServiceHelperService.checkCategoryExists(body.name, session);

      // Validate Icon
      await validateIconHelperService.execute(body.icon, session);

      const categoryData = {
        ...body,
        type: serviceTypes.Category,
        children: [],
      };

      const newCategory = await createServiceEntityHelperService.execute(
        CategoryServiceModel,
        categoryData,
        session,
        DbTransactions,
      );

      await session.commitTransaction();

      return returnServiceSuccess(
        "category_created",
        serviceResponse(newCategory),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, servicesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new createCategoryService();
