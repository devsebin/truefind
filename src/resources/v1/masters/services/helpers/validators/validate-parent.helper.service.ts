import { IBaseServiceDocument } from "@/database/services/services-db-interface";
import { BaseServiceModel } from "@/database/services/services-db-model";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../services.helper";
import { servicesErrorsMessages } from "../../services.messages";

class validateParentHelperService {
  public async execute(
    parentId: mongoose.Types.ObjectId,
    session: mongoose.ClientSession,
  ): Promise<HydratedDocument<IBaseServiceDocument>> {
    try {
      const parentCategory = await BaseServiceModel.findOne({ _id: parentId }).session(session);

      if (!parentCategory) {
        throwError(
          "parent_category_not_found",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Parent category not found",
            data: { parent_id: parentId },
            filler: { 0: parentId.toString() },
          }),
        );
      }

      if (parentCategory.type === serviceTypes.Service) {
        throwError(
          "parent_must_not_be_task",
          ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
            message: "Parent category must not be a service/task",
            data: { parent_category: parentCategory },
          }),
        );
      }

      return parentCategory;
    } catch (err: any) {
      rethrowIfKnown(err, "Error fetching parent category", servicesErrorsMessages);
    }
  }
}

export default new validateParentHelperService();
