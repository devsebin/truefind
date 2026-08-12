import { IBaseServiceDocument } from "@/database/services/services-db-interface";
import { BaseServiceModel, SubcategoryServiceModel, ServiceModel } from "@/database/services/services-db-model";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../services.helper";
import { servicesErrorsMessages } from "../../services.messages";

class findServiceHelperService {
  public async findOne(
    query: any,
    session?: mongoose.ClientSession,
  ): Promise<HydratedDocument<IBaseServiceDocument> | null> {
    try {
      let dbQuery = BaseServiceModel.findOne(query);
      if (session) {
        dbQuery = dbQuery.session(session);
      }
      return await dbQuery;
    } catch (err: any) {
      rethrowIfKnown(err, "error while finding service", servicesErrorsMessages);
    }
  }

  public async checkCategoryExists(
    name: string,
    session: mongoose.ClientSession,
  ): Promise<void> {
    try {
      const existingCategory = await BaseServiceModel.findOne({
        name,
        is_deleted: false,
        is_active: true,
      }).session(session);

      if (existingCategory) {
        throwError(
          "category_name_already_exist",
          ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
            message: "Category name already exists",
            data: { name },
            filler: { 0: name },
          }),
        );
      }
    } catch (err: any) {
      rethrowIfKnown(err, "category duplicate check failed", servicesErrorsMessages);
    }
  }

  public async checkForDuplicateSubcategoryName(
    parentId: mongoose.Types.ObjectId,
    name: string,
    session: mongoose.ClientSession,
  ): Promise<boolean> {
    const parentCategory = await BaseServiceModel.findOne({ _id: parentId })
      .populate({
        path: "children",
        model: SubcategoryServiceModel,
      })
      .session(session);

    if (!parentCategory) {
      throwError(
        "category_not_found",
        ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Parent category not found",
          data: { parent_id: parentId },
          filler: { 0: parentId.toString() },
        }),
      );
    }

    const duplicate = parentCategory.children.some(
      (child: any) => child.name.toLowerCase() === name.toLowerCase(),
    );

    if (duplicate) return true;

    for (let child of parentCategory.children as any[]) {
      const childSubcategory = await SubcategoryServiceModel.findById(child._id).session(session);

      if (
        childSubcategory &&
        childSubcategory.children &&
        childSubcategory.children.length > 0
      ) {
        const childDuplicate = await this.checkForDuplicateSubcategoryName(
          childSubcategory._id as mongoose.Types.ObjectId,
          name,
          session,
        );
        if (childDuplicate) return true;
      }
    }

    return false;
  }

  public async checkForDuplicateTaskName(
    parentId: mongoose.Types.ObjectId,
    name: string,
    session: mongoose.ClientSession,
  ): Promise<boolean> {
    const parentCategory = await BaseServiceModel.findOne({ _id: parentId })
      .populate({
        path: "children",
        model: ServiceModel,
      })
      .session(session);

    if (!parentCategory) {
      throwError(
        "category_not_found",
        ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Parent category not found",
          data: { parent_id: parentId },
          filler: { 0: parentId.toString() },
        }),
      );
    }

    const duplicate = parentCategory.children.some(
      (child: any) => child.name.toLowerCase() === name.toLowerCase(),
    );

    return duplicate;
  }
}

export default new findServiceHelperService();
