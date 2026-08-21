import { Types } from "mongoose";
import { WalletAccountModel } from "@/database/user-wallet-accounts/user-wallet-accounts-db-model";
import { WalletTransactionModel } from "@/database/user-wallet-transactions/user-wallet-transactions-db-model";
import { WalletLedgerEntryModel } from "@/database/user-wallet-ledgers/user-wallet-ledgers-db-model";
import { CurrencyCode } from "@/database/user-wallet/user-wallet-db-interface";
import { parseDecimal128ToNumber, formatMoney } from "../helpers/money.util";
import walletCoreService from "./wallet-core.service";

class WalletBalanceService {
    /**
     * Get balance summary for a user, optionally filtered by currency.
     */
    async getBalance(userId: Types.ObjectId, currency?: CurrencyCode) {
        const filter: any = { user_id: userId, is_deleted: false };
        if (currency) filter.currency = currency;

        const accounts = await WalletAccountModel.find(filter).lean();

        return accounts.map((account) => {
            const available = parseDecimal128ToNumber(account.available_balance_minor);
            const pending = parseDecimal128ToNumber(account.pending_balance_minor);
            const locked = parseDecimal128ToNumber(account.locked_balance_minor);
            const total = available + pending + locked;

            return {
                account_id: account._id,
                currency: account.currency,
                account_type: account.account_type,
                status: account.status,
                available_balance_minor: available,
                pending_balance_minor: pending,
                locked_balance_minor: locked,
                total_balance_minor: total,
                available_formatted: formatMoney(available, account.currency as CurrencyCode),
                pending_formatted: formatMoney(pending, account.currency as CurrencyCode),
                locked_formatted: formatMoney(locked, account.currency as CurrencyCode),
                total_formatted: formatMoney(total, account.currency as CurrencyCode),
            };
        });
    }

    /**
     * List transactions for a user with pagination and filtering.
     */
    async listTransactions(params: {
        user_id: Types.ObjectId;
        wallet_id?: Types.ObjectId;
        type?: string;
        status?: string;
        currency?: CurrencyCode;
        page?: number;
        limit?: number;
        sort_by?: string;
        sort_order?: "asc" | "desc";
    }) {
        const {
            user_id,
            wallet_id,
            type,
            status,
            currency,
            page = 1,
            limit = 20,
            sort_by = "createdAt",
            sort_order = "desc",
        } = params;

        const filter: any = { user_id, is_deleted: false };
        if (wallet_id) filter.wallet_id = wallet_id;
        if (type) filter.type = type;
        if (status) filter.status = status;
        if (currency) filter.currency = currency;

        const skip = (page - 1) * limit;
        const sortDir = sort_order === "asc" ? 1 : -1;

        const [transactions, total] = await Promise.all([
            WalletTransactionModel.find(filter)
                .sort({ [sort_by]: sortDir })
                .skip(skip)
                .limit(limit)
                .lean(),
            WalletTransactionModel.countDocuments(filter),
        ]);

        return {
            transactions,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
                has_next: page * limit < total,
                has_prev: page > 1,
            },
        };
    }

    /**
     * Get a single transaction by ID.
     */
    async getTransactionById(transactionId: Types.ObjectId, userId: Types.ObjectId) {
        const transaction = await WalletTransactionModel.findOne({
            _id: transactionId,
            user_id: userId,
            is_deleted: false,
        }).lean();

        if (!transaction) {
            throw new Error("TRANSACTION_NOT_FOUND");
        }

        return transaction;
    }

    /**
     * List ledger entries for a user with pagination.
     */
    async listLedgerEntries(params: {
        user_id: Types.ObjectId;
        account_id?: Types.ObjectId;
        page?: number;
        limit?: number;
    }) {
        const {
            user_id,
            account_id,
            page = 1,
            limit = 20,
        } = params;

        const filter: any = { user_id };
        if (account_id) filter.account_id = account_id;

        const skip = (page - 1) * limit;

        const [entries, total] = await Promise.all([
            WalletLedgerEntryModel.find(filter)
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            WalletLedgerEntryModel.countDocuments(filter),
        ]);

        return {
            entries,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
                has_next: page * limit < total,
                has_prev: page > 1,
            },
        };
    }
}

export default new WalletBalanceService();
