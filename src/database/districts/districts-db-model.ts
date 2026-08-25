import mongoose, { Schema } from "mongoose";
import IDistrict from "./districts-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";

const districtSchema = new Schema<IDistrict>(
    {
        name: { type: String, required: true, trim: true },
        code: {
            type: String,
            required: true,
            trim: true,
            unique: true,
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

        suburb_ids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: tableName.Suburbs,
            },
        ],
        status_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Status,
        },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true },
);

districtSchema.plugin(defaultStatusPlugin);
districtSchema.plugin(auditPlugin);

districtSchema.index(
    {
        country_id: 1,
        region_id: 1,
        code: 1,
        is_active: 1,
    },
    { unique: true, partialFilterExpression: { is_deleted: false } },
);

districtSchema.index(
    { name: 1, country_id: 1, region_id: 1 },
    { unique: true, partialFilterExpression: { is_deleted: false } },
);

districtSchema.plugin(auditPlugin);

districtSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

districtSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

const DistrictModel = mongoose.model<IDistrict>(
    tableName.Districts,
    districtSchema,
);
export default DistrictModel;
