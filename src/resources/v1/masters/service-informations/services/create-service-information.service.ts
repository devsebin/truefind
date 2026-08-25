import { SingleResponse } from "@/utils/responses/success.response";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  returnServiceInformationSuccess,
  throwServiceInformationError,
  populateFields,
} from "../service-informations.helper";
import { serviceInformationErrorsMessages } from "../service-informations.messages";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import {
  toServiceInformationDTO,
  ServiceInformationDTO,
} from "../dto/service-information.dto";
import { serviceInformationResponse } from "../service-informations.response";
import findServiceInformationHelperService from "../helpers/validators/find-service-information.helper.service";
import createServiceInformationHelperService from "../helpers/operations/create-service-information.helper.service";
import updateServiceInformationHelperService from "../helpers/operations/update-service-information.helper.service";
import findServiceHelperService from "@/resources/v1/masters/services/helpers/validators/find-service.helper.service";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import { getContextUserId } from "@/utils/context/request-context";
import findServiceStatusesHelperService from "../../service-statuses/helpers/validators/find-service-statuses.helper.service";
import { getActiveServiceStatusId } from "@/utils/plugins/service-status.plugin";

class CreateServiceInformationService {
  public async execute(
    request: Request,
    payload?: any,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body: ServiceInformationDTO = getRequestBody(
      request,
      payload,
      toServiceInformationDTO,
    );

    try {
      session.startTransaction();

      // 1. Validate service exists and is of type service
      const service = await findServiceHelperService.findOne(
        { _id: body.service_id, is_deleted: false },
        session,
      );

      if (!service) {
        throwServiceInformationError(
          "service_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Service not found",
            data: { service_id: body.service_id },
          }),
        );
      }

      if (service.type !== serviceTypes.Service) {
        throwServiceInformationError(
          "invalid_service_type",
          ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
            message: "Service type must be 'service'",
            data: { service_id: body.service_id },
          }),
        );
      }

      // 2. Check if information already exists for this service (Upsert / update if exists or create new)
      const existingInfoList = await findServiceInformationHelperService.execute(
        { service_id: body.service_id, is_deleted: false } as any,
        serviceInformationErrorsMessages,
        { session },
      );

      const userIdStr = getContextUserId();
      const userId = userIdStr
        ? new mongoose.Types.ObjectId(userIdStr)
        : request.user?.id
          ? new mongoose.Types.ObjectId(request.user.id)
          : undefined;

      let resultInfo: any;

      if (existingInfoList.length > 0) {
        const existing = existingInfoList[0];
        resultInfo = await updateServiceInformationHelperService.execute(
          existing._id as mongoose.Types.ObjectId,
          {
            how_it_works: body.how_it_works,
            included_items: body.included_items,
            insurance_coverage: body.insurance_coverage,
            faqs: body.faqs,
            disclaimers: body.disclaimers,
            is_active: true,
          },
          existing,
          userId,
          session,
          dbTransactions,
          serviceInformationErrorsMessages,
        );
      } else {
        resultInfo = await createServiceInformationHelperService.execute(
          body,
          userId,
          session,
          dbTransactions,
          serviceInformationErrorsMessages,
        );
      }

      const activeServiceStatusId = await getActiveServiceStatusId()

      service.is_active = true;
      service.status_id = activeServiceStatusId
      await service.save({ session });

      await resultInfo.populate(populateFields);

      await session.commitTransaction();

      return returnServiceInformationSuccess(
        "information_created",
        serviceInformationResponse(resultInfo),
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, serviceInformationErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new CreateServiceInformationService();
