import mongoose, { Schema } from "mongoose";
import { IBundleAreaConfigurationDocument } from "./bundle-area-configuration-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { timeUnits } from "../services/services-db-interface";

const bundleAreaConfigurationSchema = new Schema<IBundleAreaConfigurationDocument>(
    {
        bundle_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Bundles,
            required: true,
            index: true,
        },
        suburb_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Suburbs,
            required: true,
            index: true,
        },
        country_configuration_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.BundleCountryConfigurations,
            required: false,
        },
        is_callout_bundle: {
            type: Boolean,
            required: false,
        },
        is_fixed_price: {
            type: Boolean,
            required: false,
        },
        currency_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Currencies,
            required: false,
        },
        price: {
            type: Number,
            required: false,
        },
        unit_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Units,
            required: false,
        },
        minimum_price: {
            type: Number,
            required: false,
        },
        maximum_price: {
            type: Number,
            required: false,
        },
        call_out_fee: {
            type: Number,
            required: false,
        },
        estimated_time: {
            type: Number,
            required: false,
        },
        estimated_time_unit: {
            type: String,
            enum: timeUnits,
            required: false,
        },
        individual_services_total: {
            type: Number,
            required: false,
        },
        bundle_discount_type: {
            type: String,
            enum: ["FIXED", "PERCENTAGE", "NONE"],
            default: "NONE",
        },
        bundle_discount_value: {
            type: Number,
            default: 0,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true }
);

bundleAreaConfigurationSchema.index(
    { bundle_id: 1, suburb_id: 1 },
    { unique: true }
);
bundleAreaConfigurationSchema.index({ suburb_id: 1, is_active: 1 });

bundleAreaConfigurationSchema.plugin(defaultStatusPlugin);
bundleAreaConfigurationSchema.plugin(auditPlugin);

bundleAreaConfigurationSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false });
    }
});

const BundleAreaConfigurationModel = mongoose.model<IBundleAreaConfigurationDocument>(
    "BundleAreaConfiguration",
    bundleAreaConfigurationSchema,
    tableName.BundleAreaConfigurations
);

export default BundleAreaConfigurationModel;
