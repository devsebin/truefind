import { tableName } from "@/utils/definitions/constants/table-names";
import { model, Schema } from "mongoose";
import { IWalletHold } from "./user-wallet-holds-db-interface";

const WalletHoldSchema =
    new Schema<IWalletHold>(
        {
            wallet_account_id: {
                type: Schema.Types.ObjectId,
                ref: tableName.UserWalletAccount,
                required: true,
                index: true,
            },

            user_id: {
                type: Schema.Types.ObjectId,
                ref: tableName.User,
                required: true,
                index: true,
            },

            amount_minor: {
                type: Schema.Types.Decimal128,
                required: true,
            },

            currency: {
                type: String,
                enum: [
                    'INR',
                    'NZD',
                    'USD',
                    'AUD',
                    'GBP',
                ],
                required: true,
            },

            status: {
                type: String,
                enum: [
                    'active',
                    'released',
                    'captured',
                    'expired',
                    'cancelled',
                ],
                required: true,
                index: true,
            },

            reference_type: {
                type: String,
                required: true,
            },

            reference_id: {
                type: Schema.Types.ObjectId,
                required: true,
            },

            transaction_id: {
                type: Schema.Types.ObjectId,
                ref: tableName.WalletTransaction,
            },
            expires_at: {
                type: Date,
                index: true,
            },
            released_at: Date,
            captured_at: Date,
        },
        {
            timestamps: true,
        }
    );

WalletHoldSchema.index({
    wallet_account_id: 1,
    status: 1,
});

WalletHoldSchema.index({
    reference_type: 1,
    reference_id: 1,
});

WalletHoldSchema.index({
    status: 1,
    expires_at: 1,
});

export const WalletHoldModel = model<IWalletHold>(tableName.UserWalletHold, WalletHoldSchema);