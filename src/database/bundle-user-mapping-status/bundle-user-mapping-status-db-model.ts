import { IBundleUserMappingStatus } from "./bundle-user-mapping-status-db-interface";
import mongoose, { Model, Schema } from "mongoose";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { tableName } from "@/utils/definitions/constants/table-names";
import { defaultBundleUserMappingStatusPlugin } from "@/utils/plugins/bundle-user-mapping-status.plugin";


const bundleUserMappingStatusSchema = new Schema<IBundleUserMappingStatus>(
    {
        title: { type: String, required: true, unique: true },
        label: { type: String, required: true, unique: true },
        color: { type: String, required: true },
        is_default: { type: Boolean, required: false, default: false },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true },
);

bundleUserMappingStatusSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

bundleUserMappingStatusSchema.plugin(auditPlugin);

bundleUserMappingStatusSchema.methods.toJSON = function () {
    const bundleUserMappingStatusObject = this.toObject();
    delete bundleUserMappingStatusObject.__v;
    return bundleUserMappingStatusObject;
};

const BundleUserMappingStatusModel = mongoose.model<IBundleUserMappingStatus>(
    "BundleUserMappingStatusMaster",
    bundleUserMappingStatusSchema,
    tableName.BundleUserMappingStatuses,
);

export default BundleUserMappingStatusModel;