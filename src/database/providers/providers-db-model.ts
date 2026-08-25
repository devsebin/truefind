import { tableName } from "../../utils/definitions/constants/table-names";
import mongoose, { Schema } from "mongoose";
import { CommonServiceFieldsModel } from "../../utils/definitions/constants/db-constants";
import {
    IProvider,
    ISupportedCountry,
    ITestLog,
    IType,
} from "./providers-db-interface";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";

/** Sub-document: Test Log */
const TestLogSchema = new Schema<ITestLog>(
    {
        date: { type: Date, required: true },
        result: { type: String, enum: ["pass", "fail", "pending"], required: true },
        details: { type: String },
    },
    { _id: false },
);

/** Sub-document: Type */
const TypeSchema = new Schema<IType>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    payloadSchema: { type: Schema.Types.Mixed, required: true },
    is_tested: { type: Boolean, default: false },
    test_log: { type: [TestLogSchema], default: [] },
    is_default: { type: Boolean, default: false },
    is_active: { type: Boolean, default: false },
});

/** Sub-document: Supported Country */
const SupportedCountrySchema = new Schema<ISupportedCountry>({
    countryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: tableName.Countries,
        required: true,
    },
    countryCode: { type: String, required: true }, // ISO code for reference
    config: {
        type: {
            apiKey: { type: String, default: null },
            apiSecret: { type: String, default: null },
            authToken: { type: String, default: null },
            senderId: { type: String, default: null },
            username: { type: String, default: null },
            password: { type: String, default: null },
            baseUrl: { type: String, default: null },
            apiVersion: { type: String, default: null },
            additionalConfig: { type: Schema.Types.Mixed, default: {} },
        },
        default: {},
    },
    type: { type: [TypeSchema], default: [] },
    supportFrom: { type: Date, required: true },
    supportUntil: { type: Date }, // optional
    is_tested: { type: Boolean, default: false },
    is_active: { type: Boolean, default: false },
});

/** Main Provider Document Interface */

/** Provider Schema */
const ProviderSchema = new Schema<IProvider>(
    {
        name: { type: String, required: true },

        supportedCountries: { type: [SupportedCountrySchema], default: [] },

        status_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Status,
        },
        ...CommonServiceFieldsModel,
    },
    {
        timestamps: true, // adds createdAt & updatedAt
    },
);

ProviderSchema.index({ name: 1 }, { unique: true });

ProviderSchema.index(
    { name: 1, "supportedCountries.countryCode": 1 },
    { unique: true },
);

ProviderSchema.plugin(defaultStatusPlugin);
ProviderSchema.plugin(auditPlugin);

// Middleware to filter deleted and inactive providers by default

ProviderSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    // Only add condition if not already present
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

/** Model */
export const ProviderModel = mongoose.model<IProvider>(
    tableName.Providers,
    ProviderSchema,
);
