import mongoose, { Schema } from "mongoose";
import { IBundleDocument, BundleStatus } from "./bundles-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";

const bundleSchema = new Schema<IBundleDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        display_name: {
            type: String,
            required: true,
            trim: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            index: true,
        },
        description: {
            type: String,
            default: "",
        },
        icon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Documents,
            required: false,
        },
        status: {
            type: String,
            enum: ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"],
            default: "DRAFT",
            index: true,
        },
        sort_order: {
            type: Number,
            default: 0,
        },
        tags: {
            type: [String],
            default: [],
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true }
);

bundleSchema.index({ status: 1, is_active: 1 });
bundleSchema.index({ name: 1 });

bundleSchema.plugin(defaultStatusPlugin);
bundleSchema.plugin(auditPlugin);

bundleSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false });
    }
});

const BundleModel = mongoose.model<IBundleDocument>(
    "Bundle",
    bundleSchema,
    tableName.Bundles
);

export default BundleModel;
