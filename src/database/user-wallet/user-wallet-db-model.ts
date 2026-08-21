import { Schema, model, Types } from "mongoose";
import {
    CommonServiceFieldsModel,
} from "@/utils/definitions/constants/db-constants";
import { CurrencyCode, IWallet, WalletStatus } from "./user-wallet-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";


const walletSchema = new Schema<IWallet>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        wallet_number: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["active", "frozen", "suspended", "closed"] satisfies WalletStatus[],
            required: true,
            default: "active",
            index: true,
        },

        default_currency: {
            type: String,
            enum: ["INR", "NZD", "USD", "AUD", "GBP"] satisfies CurrencyCode[],
            default: "INR",
            index: true,
        },
        ...CommonServiceFieldsModel
    },
    {
        timestamps: true,
    }
);

walletSchema.index({
    user_id: 1,
    wallet_number: 1,
});

export const WalletModel = model<IWallet>(tableName.UserWallet, walletSchema);