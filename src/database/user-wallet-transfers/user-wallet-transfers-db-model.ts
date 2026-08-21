import { Schema, model } from "mongoose";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { IWalletTransfer } from "./user-wallet-transfers-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";

const WalletTransferSchema = new Schema<IWalletTransfer>(
    {
        transfer_number: {
            type: String,
            required: true,
            immutable: true,
            trim: true,
        },

        from_account_id: {
            type: Schema.Types.ObjectId,
            ref: tableName.UserWalletAccount,
            required: true,
            index: true,
        },

        to_account_id: {
            type: Schema.Types.ObjectId,
            ref: tableName.UserWalletAccount,
            required: true,
            index: true,
        },

        from_user_id: {
            type: Schema.Types.ObjectId,
            ref: tableName.User,
            required: true,
            index: true,
        },

        to_user_id: {
            type: Schema.Types.ObjectId,
            ref: tableName.User,
            required: true,
            index: true,
        },

        currency: {
            type: String,
            enum: ["INR", "NZD", "USD", "AUD", "GBP"],
            required: true,
        },

        amount_minor: {
            type: Schema.Types.Decimal128,
            required: true,
        },

        fee_minor: {
            type: Schema.Types.Decimal128,
            required: true,
            default: "0",
        },

        status: {
            type: String,
            enum: [
                "pending",
                "processing",
                "completed",
                "failed",
                "cancelled",
                "reversed",
            ],
            required: true,
            index: true,
        },

        idempotency_key: {
            type: String,
        },

        description: {
            type: String,
            maxlength: 500,
        },

        completed_at: Date,

        ...CommonServiceFieldsModel,
    },
    {
        timestamps: true,
    }
);

WalletTransferSchema.index(
    { transfer_number: 1 },
    { unique: true }
);

WalletTransferSchema.index({
    from_user_id: 1,
    createdAt: -1,
});

WalletTransferSchema.index({
    to_user_id: 1,
    createdAt: -1,
});

WalletTransferSchema.index(
    { idempotency_key: 1 },
    {
        unique: true,
        partialFilterExpression: {
            idempotency_key: { $exists: true },
        },
    }
);

export const WalletTransferModel = model<IWalletTransfer>(
    tableName.WalletTransfer,
    WalletTransferSchema
);
