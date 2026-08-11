import mongoose, { Schema, Document } from "mongoose";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { tableName } from "@/utils/definitions/constants/table-names";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { IDeclaimer } from "./declaimers-db-interface";
import "@/database/users/users-db-model";
import "@/database/status/status-db-model";
import "@/database/countries/countries-db-model";

const DeclaimerSchema = new Schema<IDeclaimer>(
    {
        key: {
            type: String,
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: true,
        },

        content: {
            type: String,
            required: true,
        },

        version: {
            type: Number,
            required: true,
        },
        is_latest: {
            type: Boolean,
            default: false,
        },
        language: {
            type: String,
            default: "en",
            index: true,
        },

        country: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Countries,
            required: true,
            index: true,
        },

        published_at: {
            type: Date,
            default: Date.now,
        },

        metadata: {
            type: Schema.Types.Mixed,
        },
        ...CommonServiceFieldsModel,
    },
    {
        timestamps: true,
    },
);

/* ------------------ Indexes ------------------ */

// Ensure unique version per key + language + country
DeclaimerSchema.index(
    { key: 1, language: 1, country: 1, version: -1 },
    { unique: true },
);

// Only one active version per key + language + country
DeclaimerSchema.index(
    { key: 1, language: 1, country: 1, is_latest: 1 },
    { unique: true, partialFilterExpression: { is_latest: true } },
);

DeclaimerSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    // Only add condition if not already present
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

DeclaimerSchema.plugin(defaultStatusPlugin);
DeclaimerSchema.plugin(auditPlugin);

const DeclaimerModel = mongoose.model<IDeclaimer>(
    tableName.Declaimers,
    DeclaimerSchema,
);

export default DeclaimerModel;
