import mongoose, { Schema } from "mongoose";
import {
    IUserBundleDocumentConfiguration,
    IServiceBundleUserDocumentUpload,
} from "./user-bundle-document-configuration-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { ServiceUserDocumentConfigurationStatus } from "../service-user-document-configuration/service-user-document-configuration-db-model";

const uploadSchema = new Schema<IServiceBundleUserDocumentUpload>(
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

const userBundleDocumentConfigurationSchema = new Schema<IUserBundleDocumentConfiguration>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: tableName.User,
            required: true,
            index: true,
        },
        user_bundle_id: {
            type: Schema.Types.ObjectId,
            ref: tableName.UserBundleMappings,
            required: true,
            index: true,
        },
        bundle_id: {
            type: Schema.Types.ObjectId,
            ref: tableName.Bundles,
            required: true,
            index: true,
        },
        document_requirement_id: {
            type: Schema.Types.ObjectId,
            ref: tableName.ServiceDocuments,
            required: true,
        },
        is_mandatory: {
            type: Boolean,
            default: false,
        },
        source_service_ids: [
            {
                type: Schema.Types.ObjectId,
                ref: tableName.Services,
            },
        ],
        uploads: [uploadSchema],
        current_status: {
            type: String,
            enum: Object.values(ServiceUserDocumentConfigurationStatus),
        },
        verified_by: {
            type: Schema.Types.ObjectId,
            ref: tableName.User,
        },
        verified_at: {
            type: Date,
        },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true }
);

userBundleDocumentConfigurationSchema.index({ user_bundle_id: 1 });
userBundleDocumentConfigurationSchema.index({ user_id: 1, current_status: 1 });
userBundleDocumentConfigurationSchema.index(
    { user_bundle_id: 1, document_requirement_id: 1 },
    { unique: true }
);

userBundleDocumentConfigurationSchema.plugin(defaultStatusPlugin);
userBundleDocumentConfigurationSchema.plugin(auditPlugin);

userBundleDocumentConfigurationSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false });
    }
});

const UserBundleDocumentConfigurationModel = mongoose.model<IUserBundleDocumentConfiguration>(
    "UserBundleDocumentConfiguration",
    userBundleDocumentConfigurationSchema,
    tableName.UserBundleDocumentConfigurations
);

export default UserBundleDocumentConfigurationModel;
