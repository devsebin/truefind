import mongoose, { Schema } from "mongoose";
import { IBundleCountryConfigurationDocument } from "./bundle-country-configuration-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { timeUnits } from "../services/services-db-interface";

const bundleCountryConfigurationSchema = new Schema<IBundleCountryConfigurationDocument>(
    {
        bundle_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Bundles,
            required: true,
            index: true,
        },
        country_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Countries,
            required: true,
            index: true,
        },
        is_callout_bundle: {
            type: Boolean,
            required: true,
            default: false,
        },
        is_fixed_price: {
            type: Boolean,
            required: true,
            default: false,
        },
        currency_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Currencies,
            required: true,
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

bundleCountryConfigurationSchema.index(
    { bundle_id: 1, country_id: 1 },
    { unique: true }
);
bundleCountryConfigurationSchema.index({ country_id: 1, is_active: 1 });

bundleCountryConfigurationSchema.plugin(defaultStatusPlugin);
bundleCountryConfigurationSchema.plugin(auditPlugin);

bundleCountryConfigurationSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false });
    }
});

const BundleCountryConfigurationModel = mongoose.model<IBundleCountryConfigurationDocument>(
    "BundleCountryConfiguration",
    bundleCountryConfigurationSchema,
    tableName.BundleCountryConfigurations
);

export default BundleCountryConfigurationModel;
