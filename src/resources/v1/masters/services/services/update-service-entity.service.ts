import { BaseServiceModel } from "@/database/services/services-db-model";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import validateIconHelperService from "../helpers/validators/validate-icon.helper.service";
import validateParentHelperService from "../helpers/validators/validate-parent.helper.service";
import { returnServiceSuccess, throwError, populateFields } from "../services.helper";
import { servicesErrorsMessages } from "../services.messages";
import { serviceResponse } from "../services.response";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";

class updateServiceEntityService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    body: any,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await BaseServiceModel.findById(id).session(session);
      if (!existing || existing.is_deleted) {
        throwError(
          "something_went_wrong",
          ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
            message: "Entity not found",
            data: { id },
          }),
        );
      }

      // 1. Check duplicate name excluding self
      if (body.name && body.name.toLowerCase() !== existing.name.toLowerCase()) {
        if (existing.type === serviceTypes.Category) {
          const duplicate = await BaseServiceModel.findOne({
            name: body.name,
            type: serviceTypes.Category,
            _id: { $ne: id },
            is_deleted: false,
          }).session(session);

          if (duplicate) {
            throwError(
              "category_name_already_exist",
              ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
                message: "Category name already exists",
                data: { name: body.name },
                filler: { 0: body.name },
              }),
            );
          }
        } else if (existing.type === serviceTypes.Subcategory) {
          // Find parent containing this subcategory
          const oldParent = await BaseServiceModel.findOne({ children: id } as any).session(session);
          const targetParentId = body.parent_id || (oldParent ? oldParent._id : undefined);

          if (targetParentId) {
            const parentDoc = await BaseServiceModel.findOne({ _id: targetParentId })
              .populate("children")
              .session(session);

            if (parentDoc) {
              const duplicate = parentDoc.children.some(
                (child: any) =>
                  child.type === serviceTypes.Subcategory &&
                  child.name.toLowerCase() === body.name.toLowerCase() &&
                  child._id.toString() !== id.toString(),
              );
              if (duplicate) {
                throwError(
                  "subcategory_name_already_exist",
                  ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
                    message: "Subcategory name already exists under this parent",
                    data: { name: body.name },
                    filler: { 0: body.name },
                  }),
                );
              }
            }
          }
        } else if (existing.type === serviceTypes.Service) {
          // Find parent containing this service
          const oldParent = await BaseServiceModel.findOne({ children: id } as any).session(session);
          const targetParentId = body.parent_id || (oldParent ? oldParent._id : undefined);

          if (targetParentId) {
            const parentDoc = await BaseServiceModel.findOne({ _id: targetParentId })
              .populate("children")
              .session(session);

            if (parentDoc) {
              const duplicate = parentDoc.children.some(
                (child: any) =>
                  child.type === serviceTypes.Service &&
                  child.name.toLowerCase() === body.name.toLowerCase() &&
                  child._id.toString() !== id.toString(),
              );
              if (duplicate) {
                throwError(
                  "task_name_already_exist",
                  ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
                    message: "Task name already exists under this category",
                    data: { name: body.name },
                    filler: { 0: body.name },
                  }),
                );
              }
            }
          }
        }
      }

      // 2. Validate Icon if updated
      if (body.icon) {
        await validateIconHelperService.execute(new mongoose.Types.ObjectId(body.icon), session);
      }

      // 3. Update parent category/subcategory references if parent_id is updated
      if (body.parent_id) {
        const oldParent = await BaseServiceModel.findOne({ children: id } as any).session(session);

        if (!oldParent || oldParent._id.toString() !== body.parent_id.toString()) {
          // Validate new parent existence and type
          const newParent = await validateParentHelperService.execute(
            new mongoose.Types.ObjectId(body.parent_id),
            session,
          );

          // Remove child ID from old parent if any
          if (oldParent) {
            oldParent.children = oldParent.children.filter(
              (childId: any) => childId.toString() !== id.toString(),
            );
            await oldParent.save({ session });
          }

          // Add child ID to new parent
          newParent.children.push(id as any);
          await newParent.save({ session });
        }
      }

      // 4. Update fields on the document
      const snapshot = existing.toObject();

      const fieldsToUpdate = [
        "name",
        "description",
        "icon",
        "requiredLicenses",
        "is_callout_service",
        "is_fixed_price",
        "task_unit",
        "task_unit_price",
        "maximum_unit_price",
        "minimum_unit_price",
        "estimated_time",
        "estimated_time_unit",
        "priority_id",
      ];

      fieldsToUpdate.forEach((field) => {
        if (body[field] !== undefined) {
          (existing as any)[field] = body[field];
        }
      });

      existing.updated_by = userId;
      await existing.save({ session });

      const changes = updatedFields(existing.toObject(), snapshot);
      dbTransactions.push(
        await createDbTransaction(
          BaseServiceModel.modelName,
          apiMethods.PATCH,
          operationTypes.Update,
          existing,
          changes,
        ),
      );

      await existing.populate(populateFields);

      await session.commitTransaction();

      return returnServiceSuccess(
        "service_updated",
        serviceResponse(existing),
        dbTransactions,
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

export default new updateServiceEntityService();
