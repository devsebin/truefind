import { tableName } from "@/utils/definitions/constants/table-names";
import mongoose, { Schema } from "mongoose";
import { IServiceUserDocumentConfiguration, IServiceUserDocumentUploads } from "./service-user-document-configuration-db-interface";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import "@/database/users/users-db-model";
import "@/database/services/services-db-model";
import "@/database/service-documents/service-documents-db-model";
import "@/database/documents/documents-db-model";
import "@/database/document-types/document-types-db-model";



export enum ServiceUserDocumentConfigurationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

const UploadSchema = new Schema<IServiceUserDocumentUploads>(
    {
        document_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: tableName.Documents,
        },
        uploaded_at: { type: Date },
        verified_by: { type: Schema.Types.ObjectId, ref: tableName.User },
        verified_at: { type: Date },
        status: {
            type: String,
            enum: Object.values(ServiceUserDocumentConfigurationStatus),
        },
        validation_notes: { type: String },
    },
    { _id: false }
);

const ServiceUserDocumentConfigurationSchema = new Schema<IServiceUserDocumentConfiguration>(
    {
        user_id: { type: Schema.Types.ObjectId, required: true, ref: tableName.User },
        task_id: { type: Schema.Types.ObjectId, required: true, ref: tableName.Services },
        document_requirement_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: tableName.ServiceDocuments,
        },
        is_mandatory: { type: Boolean, default: false },
        uploads: [UploadSchema],
        current_status: {
            type: String,
            enum: Object.values(ServiceUserDocumentConfigurationStatus),
        },
        verified_by: { type: Schema.Types.ObjectId, ref: tableName.User },
        verified_at: { type: Date },
        status_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Status,
        },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true }
);


ServiceUserDocumentConfigurationSchema.plugin(auditPlugin)
ServiceUserDocumentConfigurationSchema.plugin(defaultStatusPlugin)


ServiceUserDocumentConfigurationSchema.methods.toJSON = function () {
    const countryObject = this.toObject();
    delete countryObject.__v;
    return countryObject;
};

// Create and export the model
const ServiceUserDocumentConfigurationsModel = mongoose.model<IServiceUserDocumentConfiguration>(
    tableName.ServiceUserDocumentConfigurations,
    ServiceUserDocumentConfigurationSchema
);

export default ServiceUserDocumentConfigurationsModel;
