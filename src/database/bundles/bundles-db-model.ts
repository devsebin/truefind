import mongoose, { Schema } from "mongoose";
import { IBundleDocument } from "./bundles-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { defaultBundleStatusPlugin } from "@/utils/plugins/bundle-status.plugin";

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
            required: true,
        },
        status_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.BundleStatuses,
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
        is_active: { type: Boolean, default: false },
    },
    { timestamps: true }
);

bundleSchema.index({ status_id: 1, is_active: 1 });

bundleSchema.plugin(auditPlugin);
bundleSchema.plugin(defaultBundleStatusPlugin);

bundleSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false });
    }
});

const BundleModel = mongoose.model<IBundleDocument>(
    tableName.Bundles,
    bundleSchema,
    tableName.Bundles
);

export default BundleModel;
