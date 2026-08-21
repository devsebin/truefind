import { Types } from "mongoose";
import { CurrencyCode } from "@/database/user-wallet/user-wallet-db-interface";

// ─── Re-export DB-level types ────────────────────────────────────
export type { CurrencyCode } from "@/database/user-wallet/user-wallet-db-interface";
export type { WalletStatus } from "@/database/user-wallet/user-wallet-db-interface";
export type { WalletAccountStatus, AccountType } from "@/database/user-wallet-accounts/user-wallet-accounts-db-interface";
export type { TransactionStatus, TransactionType } from "@/database/user-wallet-transactions/user-wallet-transactions-db-interface";
export type { LedgerDirection } from "@/database/user-wallet-ledgers/user-wallet-ledgers-db-interface";
export type { HoldStatus } from "@/database/user-wallet-holds/user-wallet-holds-db-interface";

// ─── Service-Level Param Interfaces ──────────────────────────────

export interface CreditParams {
    wallet_id: Types.ObjectId;
    account_id: Types.ObjectId;
    user_id: Types.ObjectId;
    amount_minor: number;
    currency: CurrencyCode;
    type: "deposit" | "refund" | "cashback" | "adjustment" | "reversal";
    description?: string;
    idempotency_key?: string;
    external_reference?: string;
    reference_type?: string;
    reference_id?: Types.ObjectId;
    parent_transaction_id?: Types.ObjectId;
    metadata?: Record<string, unknown>;
}

export interface DebitParams {
    wallet_id: Types.ObjectId;
    account_id: Types.ObjectId;
    user_id: Types.ObjectId;
    amount_minor: number;
    currency: CurrencyCode;
    type: "withdrawal" | "purchase" | "fee" | "adjustment" | "payout" | "commission";
    description?: string;
    idempotency_key?: string;
    external_reference?: string;
    reference_type?: string;
    reference_id?: Types.ObjectId;
    parent_transaction_id?: Types.ObjectId;
    metadata?: Record<string, unknown>;
}

export interface HoldParams {
    wallet_account_id: Types.ObjectId;
    user_id: Types.ObjectId;
    amount_minor: number;
    currency: CurrencyCode;
    reference_type: string;
    reference_id: Types.ObjectId;
    expires_at?: Date;
    description?: string;
}

export interface ReleaseHoldParams {
    hold_id: Types.ObjectId;
    user_id: Types.ObjectId;
    reason?: string;
}

export interface CaptureHoldParams {
    hold_id: Types.ObjectId;
    user_id: Types.ObjectId;
    /** If provided, captures a partial amount; otherwise captures the full hold */
    capture_amount_minor?: number;
    description?: string;
}

export interface TransferParams {
    from_user_id: Types.ObjectId;
    to_user_id: Types.ObjectId;
    amount_minor: number;
    currency: CurrencyCode;
    fee_minor?: number;
    description?: string;
    idempotency_key: string;
}

export interface RefundParams {
    parent_transaction_id: Types.ObjectId;
    user_id: Types.ObjectId;
    amount_minor: number;
    currency: CurrencyCode;
    reason?: string;
    idempotency_key: string;
}

export interface ReverseParams {
    parent_transaction_id: Types.ObjectId;
    user_id: Types.ObjectId;
    amount_minor: number;
    currency: CurrencyCode;
    reason?: string;
    external_reference?: string;
    idempotency_key?: string;
}

export interface DepositInitParams {
    user_id: Types.ObjectId;
    amount_minor: number;
    currency: CurrencyCode;
    provider: "stripe" | "paypal";
    idempotency_key: string;
    description?: string;
    metadata?: Record<string, unknown>;
}

export interface WithdrawalParams {
    user_id: Types.ObjectId;
    amount_minor: number;
    currency: CurrencyCode;
    provider: "stripe" | "paypal";
    payout_destination: string;
    idempotency_key: string;
    description?: string;
}

export interface BalanceQueryParams {
    user_id: Types.ObjectId;
    currency?: CurrencyCode;
}

export interface TransactionListParams {
    user_id: Types.ObjectId;
    wallet_id?: Types.ObjectId;
    type?: string;
    status?: string;
    currency?: CurrencyCode;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
}

export interface LedgerListParams {
    user_id: Types.ObjectId;
    account_id?: Types.ObjectId;
    page?: number;
    limit?: number;
}

/** Payment provider adapter interface for upgradability */
export interface IPaymentProviderAdapter {
    createPaymentIntent(params: {
        amount_minor: number;
        currency: CurrencyCode;
        metadata?: Record<string, unknown>;
    }): Promise<{ provider_reference: string; client_secret?: string; redirect_url?: string }>;

    createPayout(params: {
        amount_minor: number;
        currency: CurrencyCode;
        destination: string;
        metadata?: Record<string, unknown>;
    }): Promise<{ provider_reference: string }>;

    verifyWebhookSignature(params: {
        payload: string | Buffer;
        signature: string;
        secret: string;
    }): Promise<{ valid: boolean; event?: any }>;
}
