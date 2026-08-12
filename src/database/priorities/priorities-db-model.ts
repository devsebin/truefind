import mongoose, { Schema } from "mongoose";
import IStatus from "./priorities-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";

const prioritiesSchema = new Schema<IStatus>(
    {
        title: { type: String, required: true, unique: true },
        label: { type: String, required: true, unique: true },
        color: { type: String, required: true },
        is_default: { type: Boolean, required: false, default: false },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true },
);

prioritiesSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

prioritiesSchema.plugin(defaultStatusPlugin);
prioritiesSchema.plugin(auditPlugin);

prioritiesSchema.methods.toJSON = function () {
    const prioritiesObject = this.toObject();
    delete prioritiesObject.__v;
    return prioritiesObject;
};

const PrioritiesModel = mongoose.model<IStatus>(
    "PrioritiesMaster",
    prioritiesSchema,
    tableName.Priorities,
);

export default PrioritiesModel;
