import mongoose, { Model, Schema } from "mongoose";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { tableName } from "@/utils/definitions/constants/table-names";
import { IBundleLocationConfigStatus } from "./bundle-location-config-status-db-interface";


const bundleLocationConfigStatusesSchema = new Schema<IBundleLocationConfigStatus>(
    {
        title: { type: String, required: true, unique: true },
        label: { type: String, required: true, unique: true },
        color: { type: String, required: true },
        is_default: { type: Boolean, required: false, default: false },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true },
);

bundleLocationConfigStatusesSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

bundleLocationConfigStatusesSchema.plugin(auditPlugin);

bundleLocationConfigStatusesSchema.methods.toJSON = function () {
    const bundleLocationConfigStatusesObject = this.toObject();
    delete bundleLocationConfigStatusesObject.__v;
    return bundleLocationConfigStatusesObject;
};

const BundleLocationConfigStatusesModel = mongoose.model<IBundleLocationConfigStatus>(
    tableName.BundleLocationConfigStatuses,
    bundleLocationConfigStatusesSchema,
    tableName.BundleLocationConfigStatuses,
);

export default BundleLocationConfigStatusesModel;