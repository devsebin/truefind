
import mongoose, { Schema } from "mongoose";
import { IServiceDocumentConfiguration } from "./service-document-configuration-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";

const ServiceDocumentConfigurationSchema = new Schema(
    {
        service_id: {
            type: Schema.Types.ObjectId,
            ref: tableName.Services,
            required: true,
        },
        required_documents: [
            {
                document_id: {
                    type: Schema.Types.ObjectId,
                    ref: tableName.ServiceDocuments,
                    required: true,
                },
                is_mandatory: { type: Boolean, default: true },
                exemption_documents: [
                    {
                        document_id: {
                            type: Schema.Types.ObjectId,
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
                status_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: tableName.Status,
                },
                ...CommonServiceFieldsModel, // <== Add this here
            },
        ],
        status_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Status,
        },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true }
);

ServiceDocumentConfigurationSchema.plugin(auditPlugin);
ServiceDocumentConfigurationSchema.plugin(defaultStatusPlugin)

ServiceDocumentConfigurationSchema.path("required_documents").validate(function (value) {
    const seen = new Set();
    for (const doc of value) {
        const id = doc.document_id?.toString();
        if (seen.has(id)) return false;
        seen.add(id);
    }
    return true;
}, "Duplicate document_id entries are not allowed in required_documents");

ServiceDocumentConfigurationSchema.methods.toJSON = function () {
    const countryObject = this.toObject();
    delete countryObject.__v;
    return countryObject;
};

// Create and export the model
const ServiceDocumentConfigurationModel = mongoose.model<IServiceDocumentConfiguration>(
    tableName.ServiceDocumentConfigurations,
    ServiceDocumentConfigurationSchema
);

export default ServiceDocumentConfigurationModel;
