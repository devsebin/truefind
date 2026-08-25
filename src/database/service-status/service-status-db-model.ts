import mongoose, { Schema, model } from "mongoose";
import { tableName } from "../../utils/definitions/constants/table-names";
import { IServiceStatus } from "./service-status-db-interface";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";

const ServiceStatusSchema = new Schema<IServiceStatus>(
    {
        title: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            required: true,
        },
        is_default: {
            type: Boolean,
            required: false,
            default: false,
        },
        status_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Status,
        },
        ...CommonServiceFieldsModel
    },

    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
    },
);

ServiceStatusSchema.methods.toJSON = function () {
    const statusObject = this.toObject();
    delete statusObject.__v;
    return statusObject;
};

ServiceStatusSchema.index({ title: 1 });
ServiceStatusSchema.index(
    { is_default: 1 },
    {
        unique: true,
        partialFilterExpression: {
            is_default: true,
            is_active: true,
        },
        name: "unique_active_default_status",
    },
);

const ServiceStatusModel = model<IServiceStatus>(tableName.ServiceStatus, ServiceStatusSchema);

export default ServiceStatusModel;
