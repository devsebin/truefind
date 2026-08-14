import { tableName } from "@/utils/definitions/constants/table-names";
import mongoose, { Schema } from "mongoose";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { IBaseServiceDocument, ICategoryDocument, ISubcategoryDocument, ITaskServiceDocument, timeUnits } from "./services-db-interface";

/*---------------- Task ----------------*/
const TaskSchema = new Schema<ITaskServiceDocument>(
    {
        name: { type: String, required: true },
        description: { type: String, default: "" },
        icon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Documents,
            required: true,
        },
        estimated_time: { type: Number, default: 0 },
        estimated_time_unit: {
            type: String,
            enum: timeUnits,
            default: timeUnits.hours,
        },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true },
);

/*---------------- Base (Category/Subcategory) ----------------*/
const BaseServiceSchema = new Schema<IBaseServiceDocument>(
    {
        name: { type: String, required: true },

        type: {
            type: String,
            enum: [serviceTypes.Category, serviceTypes.Subcategory],
            required: true,
        },
        description: { type: String, default: "", required: true },
        icon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Documents,
            required: true,
        },
        children: [
            { type: mongoose.Schema.Types.ObjectId, ref: tableName.Services },
        ], // references tasks or subcategories
        ...CommonServiceFieldsModel,
    },
    { discriminatorKey: "type", timestamps: true },
);

/*---------------- Models ----------------*/
export const BaseServiceModel = mongoose.model<IBaseServiceDocument>(
    tableName.Services,
    BaseServiceSchema,
);

export const ServiceModel =
    BaseServiceModel.discriminator<ITaskServiceDocument>(
        serviceTypes.Service,
        TaskSchema, // Pass TaskSchema to add task-specific fields
    );

export const CategoryServiceModel =
    BaseServiceModel.discriminator<ICategoryDocument>(
        serviceTypes.Category,
        new Schema({}),
    );

export const SubcategoryServiceModel =
    BaseServiceModel.discriminator<ISubcategoryDocument>(
        serviceTypes.Subcategory,
        new Schema({}),
    );

export default {
    BaseServiceModel,
    CategoryServiceModel,
    SubcategoryServiceModel,
    ServiceModel,
};
