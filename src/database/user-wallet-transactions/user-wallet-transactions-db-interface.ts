import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";
import { CurrencyCode } from "../user-wallet/user-wallet-db-interface";

export type TransactionStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'reversed';

export type TransactionType =
    | 'deposit'
    | 'withdrawal'
    | 'purchase'
    | 'refund'
    | 'transfer'
    | 'fee'
    | 'cashback'
    | 'reversal'
    | 'adjustment'
    | 'payout'
    | 'commission';

export interface IWalletTransaction extends CommonServiceFieldsInterface {
    transaction_number: string;
    wallet_id?: Types.ObjectId;
    user_id?: Types.ObjectId;
    type: TransactionType;
    status: TransactionStatus;
    currency: CurrencyCode;
    amount_minor: Types.Decimal128;
    fee_minor: Types.Decimal128;
    net_amount_minor: Types.Decimal128;
    idempotency_key?: string;
    external_reference?: string;
    reference_type?: string;
    reference_id?: Types.ObjectId;
    parent_transaction_id?: Types.ObjectId;
    transfer_id?: Types.ObjectId;
    description?: string;
    metadata?: Record<string, unknown>;
    failure_code?: string;
    failure_reason?: string;
    processed_at?: Date;
    completed_at?: Date;
}

