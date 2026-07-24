import mongoose, { Schema } from "mongoose";
import IRegion from "./regions-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";

const regionSchema = new Schema<IRegion>(
    {
        name: { type: String, required: true },
        code: { type: String, required: true },
        country_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Countries,
            required: true,
        },
        district_ids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: tableName.Districts,
            },
        ],
        ...CommonServiceFieldsModel,
    },
    { timestamps: true },
);

regionSchema.index(
    { code: 1 },
    {
        unique: true,
        partialFilterExpression: { is_active: true, is_deleted: false },
    },
);

regionSchema.index(
    { name: 1 },
    {
        unique: true,
        partialFilterExpression: { is_active: true, is_deleted: false },
    },
);

regionSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

regionSchema.plugin(defaultStatusPlugin);
regionSchema.plugin(auditPlugin);

regionSchema.methods.toJSON = function () {
    const regionObject = this.toObject();
    delete regionObject.__v;
    return regionObject;
};

const RegionModel = mongoose.model<IRegion>(
    tableName.Regions,
    regionSchema,
);

export default RegionModel;
