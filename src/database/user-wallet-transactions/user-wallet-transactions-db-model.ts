import mongoose, { model, Schema } from "mongoose";
import { IWalletTransaction } from "./user-wallet-transactions-db-interface";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { tableName } from "@/utils/definitions/constants/table-names";

const WalletTransactionSchema =
    new Schema<IWalletTransaction>(
        {
            transaction_number: {
                type: String,
                required: true,
                unique: true,
                immutable: true,
            },
            wallet_id: {
                type: Schema.Types.ObjectId,
                ref: 'Wallet',
                index: true,
            },
            user_id: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                index: true,
            },
            type: {
                type: String,
                enum: [
                    'deposit',
                    'withdrawal',
                    'purchase',
                    'refund',
                    'transfer',
                    'fee',
                    'cashback',
                    'reversal',
                    'adjustment',
                    'payout',
                    'commission',
                ],
                required: true,
            },
            status: {
                type: String,
                enum: [
                    'pending',
                    'processing',
                    'completed',
                    'failed',
                    'cancelled',
                    'reversed',
                ],
                required: true,
                index: true,
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
            amount_minor: {
                type: Schema.Types.Decimal128,
                required: true,
            },
            fee_minor: {
                type: Schema.Types.Decimal128,
                required: true,
                default: 0,
            },
            net_amount_minor: {
                type: Schema.Types.Decimal128,
                required: true,
            },
            idempotency_key: {
                type: String,
            },
            external_reference: {
                type: String,
            },
            reference_type: {
                type: String,
            },
            reference_id: {
                type: Schema.Types.ObjectId,
                index: true,
            },
            parent_transaction_id: {
                type: Schema.Types.ObjectId,
                ref: 'WalletTransaction',
                index: true,
            },
            transfer_id: {
                type: Schema.Types.ObjectId,
                ref: 'WalletTransfer',
                index: true,
            },
            description: {
                type: String,
                maxlength: 500,
            },
            metadata: {
                type: Schema.Types.Mixed,
            },
            failure_code: String,
            failure_reason: String,
            processed_at: Date,

            completed_at: Date,
            status_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: tableName.Status,
            },
            ...CommonServiceFieldsModel
        },
        {
            timestamps: true,
        }
    );

WalletTransactionSchema.index({
    wallet_id: 1,
    created_at: -1,
});

WalletTransactionSchema.index({
    user_id: 1,
    created_at: -1,
});

WalletTransactionSchema.index({
    status: 1,
    created_at: -1,
});

WalletTransactionSchema.index({
    reference_type: 1,
    reference_id: 1,
});

WalletTransactionSchema.index({
    external_reference: 1,
});

WalletTransactionSchema.index(
    { idempotency_key: 1 },
    {
        unique: true,
        partialFilterExpression: {
            idempotency_key: {
                $exists: true,
            },
        },
    }
);

export const WalletTransactionModel = model<IWalletTransaction>(tableName.WalletTransaction, WalletTransactionSchema);