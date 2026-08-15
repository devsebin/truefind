import mongoose, { Schema } from "mongoose";
import ISuburb from "./suburbs-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";

const GeoJSONBoundarySchema = new Schema(
    {
        type: {
            type: String,
            enum: ["Polygon", "MultiPolygon"],
            required: true,
        },

        coordinates: {
            type: Schema.Types.Mixed,
            required: true,
        },
    },
    { _id: false },
);

const suburbSchema = new Schema<ISuburb>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        code: {
            type: String,
            required: true,
            trim: true,
        },

        country_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Countries,
            required: true,
        },

        region_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Regions,
            required: true,
        },

        district_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Districts,
            required: true,
        },

        post_code: {
            type: String,
            required: true,
        },

        boundary: {
            type: GeoJSONBoundarySchema,
            required: true,
        },

        ...CommonServiceFieldsModel,
    },
    { timestamps: true },
);


suburbSchema.index({
    boundary: "2dsphere",
});

suburbSchema.index(
    { country_id: 1, region_id: 1, district_id: 1, code: 1 },
    { unique: true },
);
suburbSchema.index({ region_id: 1 });

suburbSchema.plugin(defaultStatusPlugin);
suburbSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false });
    }
    if (!this.getFilter().hasOwnProperty("is_active")) {
        this.where({ is_active: true });
    }
});

suburbSchema.plugin(auditPlugin);
suburbSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

const SuburbModel = mongoose.model<ISuburb>(tableName.Suburbs, suburbSchema);
export default SuburbModel;
