import mongoose, { Schema, model } from "mongoose";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { IWalletReconciliation, ReconciliationStatus } from "./user-wallet-reconciliations-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";

const WalletReconciliationSchema = new Schema<IWalletReconciliation>(
    {
        provider: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        reconciliation_date: {
            type: Date,
            required: true,
            index: true,
        },

        currency: {
            type: String,
            enum: ["INR", "NZD", "USD", "AUD", "GBP"],
            required: true,
        },

        external_total_minor: {
            type: Schema.Types.Decimal128,
            required: true,
        },

        ledger_total_minor: {
            type: Schema.Types.Decimal128,
            required: true,
        },

        wallet_total_minor: {
            type: Schema.Types.Decimal128,
            required: true,
        },

        discrepancy_minor: {
            type: Schema.Types.Decimal128,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "matched",
                "discrepancy",
                "investigating",
                "resolved",
            ] satisfies ReconciliationStatus[],
            required: true,
            index: true,
        },

        notes: {
            type: String,
            maxlength: 2000,
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

WalletReconciliationSchema.index({
    provider: 1,
    reconciliation_date: -1,
});

WalletReconciliationSchema.index({
    status: 1,
    reconciliation_date: -1,
});

export const WalletReconciliationModel = model<IWalletReconciliation>(
    tableName.WalletReconciliation,
    WalletReconciliationSchema
);
