import mongoose, { Schema } from "mongoose";
import { IUserBundleMapping } from "./user-bundle-mappings-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";

const userBundleMappingSchema = new Schema<IUserBundleMapping>(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.User,
            required: true,
            index: true,
        },
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
        suburb_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Suburbs,
            required: true,
            index: true,
        },
        bundle_country_configuration_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.BundleCountryConfigurations,
            required: false,
        },
        bundle_area_configuration_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.BundleAreaConfigurations,
            required: false,
        },
        status: {
            type: String,
            enum: [
                "PENDING",
                "DOCUMENTS_PENDING",
                "DOCUMENTS_SUBMITTED",
                "UNDER_REVIEW",
                "APPROVED",
                "IN_PROGRESS",
                "COMPLETED",
                "REJECTED",
                "CANCELLED",
                "ON_HOLD",
            ],
            default: "PENDING",
            index: true,
        },
        currency_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Currencies,
            required: true,
        },
        bundle_price_minor: {
            type: Number,
            required: true,
            default: 0,
        },
        individual_services_total_minor: {
            type: Number,
            required: true,
            default: 0,
        },
        discount_amount_minor: {
            type: Number,
            required: true,
            default: 0,
        },
        pricing_snapshot: {
            bundle_price_minor: { type: Number, required: true },
            individual_services_total_minor: { type: Number, required: true },
            discount_amount_minor: { type: Number, required: true },
            discount_type: { type: String, enum: ["FIXED", "PERCENTAGE", "NONE"], default: "NONE" },
            discount_value: { type: Number, default: 0 },
            currency_id: { type: mongoose.Schema.Types.ObjectId, ref: tableName.Currencies, required: true },
        },
        services: [
            {
                service_id: { type: mongoose.Schema.Types.ObjectId, ref: tableName.Services, required: true },
                service_name: { type: String, required: true },
                service_price_minor: { type: Number, required: true },
                quantity: { type: Number, default: 1 },
            },
        ],
        purchased_at: {
            type: Date,
            default: Date.now,
        },
        completed_at: {
            type: Date,
        },
        cancelled_at: {
            type: Date,
        },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true }
);

userBundleMappingSchema.index({ user_id: 1, createdAt: -1 });
userBundleMappingSchema.index({ bundle_id: 1, status: 1 });
userBundleMappingSchema.index({ user_id: 1, bundle_id: 1, status: 1 });

userBundleMappingSchema.plugin(defaultStatusPlugin);
userBundleMappingSchema.plugin(auditPlugin);

userBundleMappingSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false });
    }
});

const UserBundleMappingModel = mongoose.model<IUserBundleMapping>(
    "UserBundleMapping",
    userBundleMappingSchema,
    tableName.UserBundleMappings
);

export default UserBundleMappingModel;
