import { parseDecimal128ToNumber, formatMoney } from "./helpers/money.util";
import { CurrencyCode } from "@/database/user-wallet/user-wallet-db-interface";

/**
 * Response formatters for wallet API responses.
 * Converts Mongoose documents to clean API-friendly objects.
 */

export const walletResponse = (wallet: any) => {
    if (!wallet) return null;
    return {
        id: wallet._id,
        user_id: wallet.user_id,
        wallet_number: wallet.wallet_number,
        status: wallet.status,
        default_currency: wallet.default_currency,
        is_active: wallet.is_active,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
    };
};

export const accountResponse = (account: any) => {
    if (!account) return null;
    const currency = account.currency as CurrencyCode;
    const available = parseDecimal128ToNumber(account.available_balance_minor);
    const pending = parseDecimal128ToNumber(account.pending_balance_minor);
    const locked = parseDecimal128ToNumber(account.locked_balance_minor);
    const total = available + pending + locked;

    return {
        id: account._id,
        wallet_id: account.wallet_id,
        currency: account.currency,
        account_type: account.account_type,
        status: account.status,
        available_balance_minor: available,
        pending_balance_minor: pending,
        locked_balance_minor: locked,
        total_balance_minor: total,
        available_formatted: formatMoney(available, currency),
        pending_formatted: formatMoney(pending, currency),
        locked_formatted: formatMoney(locked, currency),
        total_formatted: formatMoney(total, currency),
        version: account.version,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
    };
};

export const accountListResponse = (accounts: any[]): any[] => {
    return accounts?.map((a) => accountResponse(a)) ?? [];
};

export const transactionResponse = (txn: any) => {
    if (!txn) return null;
    const currency = txn.currency as CurrencyCode;
    const amount = parseDecimal128ToNumber(txn.amount_minor);
    const fee = parseDecimal128ToNumber(txn.fee_minor);
    const netAmount = parseDecimal128ToNumber(txn.net_amount_minor);

    return {
        id: txn._id,
        transaction_number: txn.transaction_number,
        wallet_id: txn.wallet_id,
        user_id: txn.user_id,
        type: txn.type,
        status: txn.status,
        currency: txn.currency,
        amount_minor: amount,
        fee_minor: fee,
        net_amount_minor: netAmount,
        amount_formatted: formatMoney(amount, currency),
        fee_formatted: formatMoney(fee, currency),
        net_amount_formatted: formatMoney(netAmount, currency),
        idempotency_key: txn.idempotency_key,
        external_reference: txn.external_reference,
        reference_type: txn.reference_type,
        reference_id: txn.reference_id,
        parent_transaction_id: txn.parent_transaction_id,
        transfer_id: txn.transfer_id,
        description: txn.description,
        failure_code: txn.failure_code,
        failure_reason: txn.failure_reason,
        processed_at: txn.processed_at,
        completed_at: txn.completed_at,
        createdAt: txn.createdAt,
        updatedAt: txn.updatedAt,
    };
};

export const transactionListResponse = (txns: any[]): any[] => {
    return txns?.map((t) => transactionResponse(t)) ?? [];
};

export const holdResponse = (hold: any) => {
    if (!hold) return null;
    const currency = hold.currency as CurrencyCode;
    const amount = parseDecimal128ToNumber(hold.amount_minor);

    return {
        id: hold._id,
        wallet_account_id: hold.wallet_account_id,
        user_id: hold.user_id,
        amount_minor: amount,
        amount_formatted: formatMoney(amount, currency),
        currency: hold.currency,
        status: hold.status,
        reference_type: hold.reference_type,
        reference_id: hold.reference_id,
        transaction_id: hold.transaction_id,
        expires_at: hold.expires_at,
        released_at: hold.released_at,
        captured_at: hold.captured_at,
        createdAt: hold.createdAt,
        updatedAt: hold.updatedAt,
    };
};

export const holdListResponse = (holds: any[]): any[] => {
    return holds?.map((h) => holdResponse(h)) ?? [];
};

export const transferResponse = (transfer: any) => {
    if (!transfer) return null;
    const currency = transfer.currency as CurrencyCode;
    const amount = parseDecimal128ToNumber(transfer.amount_minor);
    const fee = parseDecimal128ToNumber(transfer.fee_minor);

    return {
        id: transfer._id,
        transfer_number: transfer.transfer_number,
        from_account_id: transfer.from_account_id,
        to_account_id: transfer.to_account_id,
        from_user_id: transfer.from_user_id,
        to_user_id: transfer.to_user_id,
        currency: transfer.currency,
        amount_minor: amount,
        fee_minor: fee,
        amount_formatted: formatMoney(amount, currency),
        fee_formatted: formatMoney(fee, currency),
        status: transfer.status,
        idempotency_key: transfer.idempotency_key,
        description: transfer.description,
        completed_at: transfer.completed_at,
        createdAt: transfer.createdAt,
    };
};

export const transferListResponse = (transfers: any[]): any[] => {
    return transfers?.map((t) => transferResponse(t)) ?? [];
};

export const ledgerEntryResponse = (entry: any) => {
    if (!entry) return null;
    const currency = entry.currency as CurrencyCode;
    const amount = parseDecimal128ToNumber(entry.amount_minor);
    const before = parseDecimal128ToNumber(entry.balance_before_minor);
    const after = parseDecimal128ToNumber(entry.balance_after_minor);

    return {
        id: entry._id,
        entry_number: entry.entry_number,
        transaction_id: entry.transaction_id,
        account_id: entry.account_id,
        user_id: entry.user_id,
        direction: entry.direction,
        amount_minor: amount,
        amount_formatted: formatMoney(amount, currency),
        currency: entry.currency,
        balance_before_minor: before,
        balance_after_minor: after,
        balance_before_formatted: formatMoney(before, currency),
        balance_after_formatted: formatMoney(after, currency),
        description: entry.description,
        reference_type: entry.reference_type,
        reference_id: entry.reference_id,
        created_at: entry.created_at,
    };
};

export const ledgerListResponse = (entries: any[]): any[] => {
    return entries?.map((e) => ledgerEntryResponse(e)) ?? [];
};
