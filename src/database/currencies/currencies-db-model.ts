import mongoose, { Schema, model, Model } from "mongoose";
import { tableName } from "@/utils/definitions/constants/table-names";
import { ICurrency } from "./currencies-db-interface";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";

const currencySchema = new Schema<ICurrency>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        label: {
            type: String,
            required: true,
            trim: true,
        },

        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        symbol: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: tableName.Documents,
        },
        status_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Status,
        },
        ...CommonServiceFieldsModel,
    },
    {
        timestamps: true,
    }
);

currencySchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

currencySchema.plugin(defaultStatusPlugin);
currencySchema.plugin(auditPlugin);

currencySchema.methods.toJSON = function () {
    const unitsObject = this.toObject();
    delete unitsObject.__v;
    return unitsObject;
};

export const CurrencyModel: Model<ICurrency> = model<ICurrency>(
    tableName.Currencies,
    currencySchema
);

if (!mongoose.models["Currency"]) {
    mongoose.model<ICurrency>("Currency", currencySchema);
}

export default CurrencyModel;