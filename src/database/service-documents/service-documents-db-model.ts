import mongoose, { Schema, model } from "mongoose";
import { IDocumentDataRequirement, IDocumentExtractionHint, IDocumentValidationRules, IOCRMapping, IServiceDocumentRequirements } from "./service-documents-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import "@/database/users/users-db-model";
import "@/database/status/status-db-model";
import "@/database/documents/documents-db-model";


const ValidationRulesSchema = new Schema<IDocumentValidationRules>(
    {
        required: { type: Boolean, default: false },
        pattern: { type: String },
        min_value: { type: Schema.Types.Mixed },
        max_value: { type: Schema.Types.Mixed },
        allowed_values: [{ type: String }],
        must_match_field: { type: String },
    },
    { _id: false }
);

const ExtractionHintSchema = new Schema<IDocumentExtractionHint>(
    {
        page_number: { type: Number },
        region_hint: { type: String },
        keyword_anchor: { type: String },
    },
    { _id: false }
);

const OCRMappingSchema = new Schema<IOCRMapping>(
    {
        model_key: { type: String },
        confidence_threshold: { type: Number, default: 0.85 },
    },
    { _id: false }
);

const DocumentDataRequirementSchema = new Schema<IDocumentDataRequirement>(
    {
        field_name: { type: String, required: true },
        display_label: { type: String },
        data_type: {
            type: String,
            enum: ["string", "number", "date", "boolean"],
            required: true,
        },
        validation_rules: { type: ValidationRulesSchema },
        expected_value: { type: Schema.Types.Mixed },
        extraction_hint: { type: ExtractionHintSchema },
        ocr_mapping: { type: OCRMappingSchema },
    },
    { _id: false }
);

const ServiceDocumentRequirementSchema = new Schema<IServiceDocumentRequirements>(
    {
        name: { type: String, required: true },
        display_name: { type: String, required: true },
        item_code: { type: String, required: true },
        document_type_id: {
            type: Schema.Types.ObjectId,
            ref: tableName.DocumentTypes,
            required: true,
        },
        description: { type: String, default: "" },
        max_file_size: {
            type: Number,
            default: 5,
            min: 1,
            max: 100,
            required: true,
        },
        accepted_mimeTypes: { type: [String], default: [], required: true },
        samples: [
            {
                type: Schema.Types.ObjectId,
                ref: tableName.Documents,
                default: null,
            },
        ],
        data_requirements: [DocumentDataRequirementSchema],
        status_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Status,
        },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true }
);


import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";

ServiceDocumentRequirementSchema.plugin(defaultStatusPlugin);
ServiceDocumentRequirementSchema.plugin(auditPlugin);

ServiceDocumentRequirementSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};


const serviceDocumentRequirementModel = model<IServiceDocumentRequirements>(
    tableName.ServiceDocuments,
    ServiceDocumentRequirementSchema
);

export default serviceDocumentRequirementModel;
