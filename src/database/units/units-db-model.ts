import mongoose, { Model, model, Schema } from "mongoose";
import IUnits from "./units-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";

const unitsSchema = new Schema<IUnits>(
    {
        title: { type: String, required: true, unique: true },
        label: { type: String, required: true, unique: true },
        dimension: { type: String, required: true },
        color: { type: String, required: true },
        is_default: { type: Boolean, required: false, default: false },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true },
);

unitsSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

unitsSchema.plugin(defaultStatusPlugin);
unitsSchema.plugin(auditPlugin);

unitsSchema.methods.toJSON = function () {
    const unitsObject = this.toObject();
    delete unitsObject.__v;
    return unitsObject;
};

export const UnitsModel: Model<IUnits> = model<IUnits>(
    tableName.Units,
    unitsSchema
);

export default UnitsModel;

