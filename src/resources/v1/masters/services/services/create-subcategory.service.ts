import { SubcategoryServiceModel } from "@/database/services/services-db-model";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import { Request } from "express";
import mongoose from "mongoose";
import { toSubCategoryDTO } from "../dto/create-subcategory.dto";
import createServiceEntityHelperService from "../helpers/operations/create-service-entity.helper.service";
import updateParentCategoryHelperService from "../helpers/operations/update-parent-category.helper.service";
import findServiceHelperService from "../helpers/validators/find-service.helper.service";
import validateIconHelperService from "../helpers/validators/validate-icon.helper.service";
import validateParentHelperService from "../helpers/validators/validate-parent.helper.service";
import { returnServiceSuccess, throwError } from "../services.helper";
import { servicesErrorsMessages } from "../services.messages";
import { serviceResponse } from "../services.response";

class createSubcategoryService {
  public async execute(
    request: Request,
    payload?: any,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toSubCategoryDTO);

    try {
      session.startTransaction();

      // Check subcategory duplicate name in this parent
      const isDuplicate = await findServiceHelperService.checkForDuplicateSubcategoryName(
        body.parent_id,
        body.name,
        session,
      );

      if (isDuplicate) {
        throwError(
          "subcategory_name_already_exist",
          ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
            message: "Subcategory name already exists",
            data: { name: body.name },
            filler: { 0: body.name },
          }),
        );
      }

      // Validate Icon
      await validateIconHelperService.execute(body.icon, session);

      // Validate parent category existence and types
      const parentCategory = await validateParentHelperService.execute(
        body.parent_id,
        session,
      );

      const subcategoryData = {
        ...body,
        type: serviceTypes.Subcategory,
        children: [],
      };

      const newSubcategory = await createServiceEntityHelperService.execute(
        SubcategoryServiceModel,
        subcategoryData,
        session,
        DbTransactions,
      );

      // Update parent category children references
      await updateParentCategoryHelperService.execute(
        parentCategory,
        newSubcategory._id as mongoose.Types.ObjectId,
        session,
      );

      await session.commitTransaction();

      return returnServiceSuccess(
        "sub_category_created",
        serviceResponse(newSubcategory),
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

export default new createSubcategoryService();
