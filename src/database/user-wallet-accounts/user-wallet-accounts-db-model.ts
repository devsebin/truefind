import mongoose, { Schema, model } from "mongoose";

import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { AccountType, IWalletAccount, WalletAccountStatus } from "./user-wallet-accounts-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CurrencyCode } from "../user-wallet/user-wallet-db-interface";

const walletAccountSchema = new Schema<IWalletAccount>(
    {
        wallet_id: {
            type: Schema.Types.ObjectId,
            ref: tableName.UserWallet,
            required: true,
            index: true,
        },

        user_id: {
            type: Schema.Types.ObjectId,
            ref: tableName.User,
            required: true,
            index: true,
        },

        currency: {
            type: String,
            enum: ["INR", "NZD", "USD", "AUD", "GBP"] satisfies CurrencyCode[],
            required: true,
            index: true,
        },

        account_type: {
            type: String,
            enum: [
                "customer_wallet",
                "provider_wallet",
            ] satisfies AccountType[],
            required: true,
            index: true,
        },

        status: {
            type: String,
            enum: [
                "active",
                "frozen",
                "suspended",
                "closed",
            ] satisfies WalletAccountStatus[],
            required: true,
            default: "active",
            index: true,
        },

        available_balance_minor: {
            type: Schema.Types.Decimal128,
            required: true,
            default: "0",
        },

        pending_balance_minor: {
            type: Schema.Types.Decimal128,
            required: true,
            default: "0",
        },

        locked_balance_minor: {
            type: Schema.Types.Decimal128,
            required: true,
            default: "0",
        },

        version: {
            type: Number,
            required: true,
            default: 0,
        },
        ...CommonServiceFieldsModel
    },
    {
        timestamps: true,
    }
);

walletAccountSchema.index(
    {
        wallet_id: 1,
        currency: 1,
    },
    {
        unique: true,
    }
);

walletAccountSchema.index({
    user_id: 1,
    currency: 1,
});

export const WalletAccountModel = model<IWalletAccount>(tableName.UserWalletAccount, walletAccountSchema);