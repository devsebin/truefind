import mongoose, { Model, model, Schema } from "mongoose";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import IRole from "./roles-db-interface";

const rolesSchema = new Schema<IRole>(
    {
        title: { type: String, required: true, unique: true },
        label: { type: String, required: true, unique: true },
        color: { type: String, required: true },
        is_default: { type: Boolean, default: false },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true },
);

rolesSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

rolesSchema.plugin(defaultStatusPlugin);
rolesSchema.plugin(auditPlugin);

rolesSchema.methods.toJSON = function () {
    const rolesObject = this.toObject();
    delete rolesObject.__v;
    return rolesObject;
};

export const RolesModel: Model<IRole> = model<IRole>(
    tableName.Roles,
    rolesSchema
);

export default RolesModel;

