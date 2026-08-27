import mongoose, { Schema } from "mongoose";
import { IBundleServiceItem } from "./bundle-service-items-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";

const bundleServiceItemSchema = new Schema<IBundleServiceItem>(
    {
        bundle_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Bundles,
            required: true,
            index: true,
        },
        service_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Services,
            required: true,
            index: true,
        },
        sort_order: {
            type: Number,
            required: true,
            default: 0,
        },
        quantity: {
            type: Number,
            default: 1,
        },
        is_mandatory: {
            type: Boolean,
            default: true,
        },
        is_included: {
            type: Boolean,
            default: true,
        },
        service_name_snapshot: {
            type: String,
            default: "",
        },
        service_code_snapshot: {
            type: String,
            default: "",
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true }
);

bundleServiceItemSchema.index(
    { bundle_id: 1, service_id: 1 },
    { unique: true }
);
bundleServiceItemSchema.index({ bundle_id: 1, sort_order: 1 });

bundleServiceItemSchema.plugin(defaultStatusPlugin);
bundleServiceItemSchema.plugin(auditPlugin);

bundleServiceItemSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false });
    }
});

const BundleServiceItemModel = mongoose.model<IBundleServiceItem>(
    "BundleServiceItem",
    bundleServiceItemSchema,
    tableName.BundleServiceItems
);

export default BundleServiceItemModel;
