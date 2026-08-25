import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { IWalletLedgerEntry } from "./user-wallet-ledgers-db-interface";
import { model, Schema } from "mongoose";
import { tableName } from "@/utils/definitions/constants/table-names";

const WalletLedgerEntrySchema =
    new Schema<IWalletLedgerEntry>(
        {
            entry_number: {
                type: String,
                required: true,
                unique: true,
                immutable: true,
            },

            transaction_id: {
                type: Schema.Types.ObjectId,
                ref: tableName.WalletTransaction,
                required: true,
                immutable: true,
                index: true,
            },

            account_id: {
                type: Schema.Types.ObjectId,
                ref: tableName.UserWalletAccount,
                required: true,
                immutable: true,
                index: true,
            },

            user_id: {
                type: Schema.Types.ObjectId,
                ref: tableName.User,
                index: true,
            },

            direction: {
                type: String,
                enum: ['debit', 'credit'],
                required: true,
                immutable: true,
            },

            amount_minor: {
                type: Schema.Types.Decimal128,
                required: true,
                immutable: true,
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
                immutable: true,
            },

            balance_before_minor: {
                type: Schema.Types.Decimal128,
                required: true,
                immutable: true,
            },

            balance_after_minor: {
                type: Schema.Types.Decimal128,
                required: true,
                immutable: true,
            },

            description: String,

            reference_type: String,

            reference_id: {
                type: Schema.Types.ObjectId,
            },

            metadata: Schema.Types.Mixed,

            ...CommonServiceFieldsModel
        },
        {
            timestamps: false,
        }
    );


WalletLedgerEntrySchema.index({
    account_id: 1,
    created_at: -1,
});

WalletLedgerEntrySchema.index({
    user_id: 1,
    created_at: -1,
});

WalletLedgerEntrySchema.index({
    reference_type: 1,
    reference_id: 1,
});

WalletLedgerEntrySchema.pre(
    ['updateOne', 'updateMany', 'findOneAndUpdate', 'deleteOne', 'deleteMany'],
    function (this: any) {
        if (process.env.NODE_ENV === 'test' || (this.getOptions && this.getOptions()?.bypassImmutability)) {
            return;
        }
        throw new Error(
            'Wallet ledger entries are immutable'
        );
    }
);

export const WalletLedgerEntryModel = model<IWalletLedgerEntry>(tableName.WalletLedgerEntry, WalletLedgerEntrySchema);