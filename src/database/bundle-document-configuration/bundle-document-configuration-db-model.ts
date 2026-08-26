import mongoose, { Schema } from "mongoose";
import { IBundleDocumentConfiguration } from "./bundle-document-configuration-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";

const bundleDocumentConfigurationSchema = new Schema<IBundleDocumentConfiguration>(
    {
        bundle_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Bundles,
            required: true,
            index: true,
        },
        required_documents: [
            {
                document_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: tableName.ServiceDocuments,
                    required: true,
                },
                is_mandatory: {
                    type: Boolean,
                    default: true,
                },
                source_service_ids: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: tableName.Services,
                    },
                ],
                exemption_documents: [
                    {
                        document_id: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: tableName.ServiceDocuments,
                            default: null,
                        },
                        condition: {
                            type: String,
                            enum: ["valid", "uploaded"],
                            default: "valid",
                        },
                    },
                ],
                notes: {
                    type: String,
                    default: "",
                },
            },
        ],
        version: {
            type: Number,
            default: 1,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true }
);

bundleDocumentConfigurationSchema.index({ bundle_id: 1, is_active: 1 });

bundleDocumentConfigurationSchema.plugin(defaultStatusPlugin);
bundleDocumentConfigurationSchema.plugin(auditPlugin);

bundleDocumentConfigurationSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false });
    }
});

const BundleDocumentConfigurationModel = mongoose.model<IBundleDocumentConfiguration>(
    "BundleDocumentConfiguration",
    bundleDocumentConfigurationSchema,
    tableName.BundleDocumentConfigurations
);

export default BundleDocumentConfigurationModel;
