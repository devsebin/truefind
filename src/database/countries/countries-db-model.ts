import mongoose, { Schema } from "mongoose";
import ICountry, { ICountryProviders } from "./countries-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import "@/database/regions/regions-db-model";
import "@/database/users/users-db-model";

const countryProviderSchema = new Schema<ICountryProviders>(
    {
        provider_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Providers,
            required: true,
        },
        is_default: { type: Boolean, required: true, default: false },
    },
    { _id: false },
);
// Country Schema
const countrySchema = new Schema<ICountry>(
    {
        name: { type: String, required: true, unique: true },
        iso_code: { type: String, required: true, unique: true },
        iso_code_3: { type: String, required: true, unique: true },
        region_ids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: tableName.Regions,
                default: null,
            },
        ],
        phone_code: { type: String, required: true, default: null },
        currency: { type: String, required: true, default: null },
        continent: { type: String, required: true, default: null },
        timezone: { type: [String], default: null },
        flags: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Documents,
            required: false,
            default: null,
        },
        providers: {
            type: [countryProviderSchema],
            required: false,
            default: [],
        },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true },
);

countrySchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    // Only add condition if not already present
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

countrySchema.plugin(defaultStatusPlugin);
countrySchema.plugin(auditPlugin);

countrySchema.methods.toJSON = function () {
    const countryObject = this.toObject();
    delete countryObject.__v;
    return countryObject;
};

// Create and export the model
const CountryModel = mongoose.model<ICountry>(
    tableName.Countries,
    countrySchema,
);

export default CountryModel;
