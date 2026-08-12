import { ServiceModel } from "@/database/services/services-db-model";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import { Request } from "express";
import mongoose from "mongoose";
import { toServiceDTO } from "../dto/create-service.dto";
import createServiceEntityHelperService from "../helpers/operations/create-service-entity.helper.service";
import updateParentCategoryHelperService from "../helpers/operations/update-parent-category.helper.service";
import findServiceHelperService from "../helpers/validators/find-service.helper.service";
import validateIconHelperService from "../helpers/validators/validate-icon.helper.service";
import validateParentHelperService from "../helpers/validators/validate-parent.helper.service";
import { returnServiceSuccess, throwError } from "../services.helper";
import { servicesErrorsMessages } from "../services.messages";
import { serviceResponse } from "../services.response";

class createServiceService {
  public async execute(
    request: Request,
    payload?: any,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toServiceDTO);

    try {
      session.startTransaction();

      // Check task name duplicate under this parent
      const isDuplicate = await findServiceHelperService.checkForDuplicateTaskName(
        body.parent_id,
        body.name,
        session,
      );

      if (isDuplicate) {
        throwError(
          "task_name_already_exist",
          ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
            message: "Task name already exists under this category",
            data: { name: body.name },
            filler: { 0: body.name },
          }),
        );
      }

      // Validate Icon
      await validateIconHelperService.execute(body.icon, session);

      // Validate parent category existence and type
      const parentCategory = await validateParentHelperService.execute(
        body.parent_id,
        session,
      );

      const taskData = {
        ...body,
        type: serviceTypes.Service, // Set type to "Service"
      };

      const newTask = await createServiceEntityHelperService.execute(
        ServiceModel,
        taskData,
        session,
        DbTransactions,
      );

      // Update parent category children references
      await updateParentCategoryHelperService.execute(
        parentCategory,
        newTask._id as mongoose.Types.ObjectId,
        session,
      );

      await session.commitTransaction();

      return returnServiceSuccess(
        "service_created",
        serviceResponse(newTask),
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

export default new createServiceService();
