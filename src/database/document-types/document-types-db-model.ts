import { tableName } from "@/utils/definitions/constants/table-names";
import { IDocumentType, IDocumentTypeDocument } from "./document-types-db-interface";
import mongoose, { Model, Schema } from "mongoose";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";

const documentTypesSchema = new Schema<IDocumentType>(
    {
        title: { type: String, required: true, unique: true },
        label: { type: String, required: true, unique: true },
        color: { type: String, required: true },
        is_default: { type: Boolean, required: false, default: false },
        status_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Status,
        },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true },
);

documentTypesSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

documentTypesSchema.plugin(defaultStatusPlugin);
documentTypesSchema.plugin(auditPlugin);

documentTypesSchema.methods.toJSON = function () {
    const documentTypesObject = this.toObject();
    delete documentTypesObject.__v;
    return documentTypesObject;
};

const DocumentTypesModel = mongoose.model<IDocumentType>(
    "DocumentTypesMaster",
    documentTypesSchema,
    tableName.DocumentTypes,
);

export default DocumentTypesModel;