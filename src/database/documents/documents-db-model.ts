import mongoose, { Schema } from "mongoose";
import IDocument, { IKeys, IUrls } from "./documents-db-interface";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { tableName } from "@/utils/definitions/constants/table-names";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";

const KeysSchema = new Schema<IKeys>(
    {
        original: { type: String, required: true },
        thumbnails: [{ type: String }],
        webpThumbnails: [{ type: String }],
    },
    { _id: false },
);

const urlsSchema = new Schema<IUrls>(
    {
        original: { type: String, required: true },
        thumbnails: [{ type: String }],
        webpThumbnails: [{ type: String }],
    },
    { _id: false },
);
// Main schema
const DocumentSchema = new Schema<IDocument>(
    {
        name: { type: String, required: true },
        document_type: { type: String, required: true },
        content_type: { type: String, required: true },
        keys: { type: KeysSchema, required: true },
        unsigned_urls: { type: urlsSchema, required: false, default: undefined },
        ...CommonServiceFieldsModel,
    },
    {
        timestamps: true,
    },
);


DocumentSchema.plugin(defaultStatusPlugin);
DocumentSchema.plugin(auditPlugin);

DocumentSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    // Only add condition if not already present
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

DocumentSchema.methods.toJSON = function () {
    const countryObject = this.toObject();
    delete countryObject.__v;
    return countryObject;
};

// Create and export the model
const DocumentModel = mongoose.model<IDocument>(
    tableName.Documents,
    DocumentSchema,
);

export default DocumentModel;
