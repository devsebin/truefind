import mongoose, { Schema } from "mongoose";
import { IDeclaimer } from "./declaimers-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";

const DeclaimerSchema = new Schema<IDeclaimer>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true },
);

DeclaimerSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

DeclaimerSchema.plugin(defaultStatusPlugin);
DeclaimerSchema.plugin(auditPlugin);

export const DeclaimerModel = mongoose.model<IDeclaimer>(
    tableName.Declaimers,
    DeclaimerSchema,
);
