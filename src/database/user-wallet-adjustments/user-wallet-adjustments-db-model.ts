import mongoose, { Schema, model } from "mongoose";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { AdjustmentStatus, IWalletAdjustment } from "./user-wallet-adjustments-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";

const WalletAdjustmentSchema = new Schema<IWalletAdjustment>(
    {
        wallet_id: {
            type: Schema.Types.ObjectId,
            ref: tableName.UserWallet,
            required: true,
            index: true,
        },

        account_id: {
            type: Schema.Types.ObjectId,
            ref: tableName.UserWalletAccount,
            required: true,
            index: true,
        },

        transaction_id: {
            type: Schema.Types.ObjectId,
            ref: tableName.WalletTransaction,
            index: true,
        },

        amount_minor: {
            type: Schema.Types.Decimal128,
            required: true,
        },

        currency: {
            type: String,
            enum: ["INR", "NZD", "USD", "AUD", "GBP"],
            required: true,
        },

        direction: {
            type: String,
            enum: ["debit", "credit"],
            required: true,
        },

        reason: {
            type: String,
            required: true,
            maxlength: 1000,
        },

        requested_by: {
            type: Schema.Types.ObjectId,
            ref: tableName.User,
            required: true,
            index: true,
        },

        approved_by: {
            type: Schema.Types.ObjectId,
            ref: tableName.User,
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "completed"] satisfies AdjustmentStatus[],
            required: true,
            default: "pending",
            index: true,
        },

        completed_at: Date,

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

WalletAdjustmentSchema.index({
    wallet_id: 1,
    createdAt: -1,
});

WalletAdjustmentSchema.index({
    status: 1,
    createdAt: -1,
});

export const WalletAdjustmentModel = model<IWalletAdjustment>(
    tableName.WalletAdjustment,
    WalletAdjustmentSchema
);
