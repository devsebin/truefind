import { IBundleStatus } from "./bundle-statuses-db-interface";
import mongoose, { Model, Schema } from "mongoose";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { tableName } from "@/utils/definitions/constants/table-names";


const bundleStatusesSchema = new Schema<IBundleStatus>(
    {
        title: { type: String, required: true, unique: true },
        label: { type: String, required: true, unique: true },
        description: { type: String, required: false },
        color: { type: String, required: true },
        is_default: { type: Boolean, required: false, default: false },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true },
);

bundleStatusesSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

bundleStatusesSchema.plugin(auditPlugin);

bundleStatusesSchema.methods.toJSON = function () {
    const bundleStatusesObject = this.toObject();
    delete bundleStatusesObject.__v;
    return bundleStatusesObject;
};

const BundleStatusesModel = mongoose.model<IBundleStatus>(
    tableName.BundleStatuses,
    bundleStatusesSchema,
    tableName.BundleStatuses,
);

export default BundleStatusesModel;