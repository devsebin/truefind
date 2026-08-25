import { ClientSession, Types } from "mongoose";
import { WalletAccountModel } from "@/database/user-wallet-accounts/user-wallet-accounts-db-model";
import { WalletTransactionModel } from "@/database/user-wallet-transactions/user-wallet-transactions-db-model";
import { WalletLedgerEntryModel } from "@/database/user-wallet-ledgers/user-wallet-ledgers-db-model";
import { CurrencyCode } from "@/database/user-wallet/user-wallet-db-interface";
import { TransactionType } from "@/database/user-wallet-transactions/user-wallet-transactions-db-interface";
import { LedgerDirection } from "@/database/user-wallet-ledgers/user-wallet-ledgers-db-interface";
import { generateTransactionNumber, generateEntryNumber } from "../helpers/transaction-number.util";
import { validateAmount, parseDecimal128ToNumber } from "../helpers/money.util";
import { checkIdempotency } from "../helpers/idempotency.util";
import { withWalletTransaction } from "../helpers/with-wallet-transaction.util";
import walletCoreService from "./wallet-core.service";

/**
 * Central authority for all financial movements.
 * Every credit/debit creates a transaction + ledger entries + balance update atomically.
 */
class WalletLedgerService {
    /**
     * Credit a wallet account.
     * Creates: transaction (completed) + ledger entry (credit) + balance increment.
     * All inside a MongoDB transaction.
     */
    async credit(params: {
        wallet_id: Types.ObjectId;
        account_id: Types.ObjectId;
        user_id: Types.ObjectId;
        amount_minor: number;
        currency: CurrencyCode;
        type: TransactionType;
        description?: string;
        idempotency_key?: string;
        external_reference?: string;
        reference_type?: string;
        reference_id?: Types.ObjectId;
        parent_transaction_id?: Types.ObjectId;
        transfer_id?: Types.ObjectId;
        metadata?: Record<string, unknown>;
        fee_minor?: number;
    }) {
        const {
            wallet_id, account_id, user_id, amount_minor, currency, type,
            description, idempotency_key, external_reference, reference_type,
            reference_id, parent_transaction_id, transfer_id, metadata,
            fee_minor = 0,
        } = params;

        validateAmount(amount_minor, currency);

        return withWalletTransaction(async (session) => {
            // Idempotency check
            if (idempotency_key) {
                const existing = await checkIdempotency(idempotency_key, session);
                if (existing) return existing;
            }

            // Validate wallet & account
            const wallet = await walletCoreService.getWalletById(wallet_id, session);
            walletCoreService.validateWalletActive(wallet);

            const account = await WalletAccountModel.findOne(
                { _id: account_id, is_deleted: false },
                null,
                { session }
            );
            if (!account) throw new Error("WALLET_ACCOUNT_NOT_FOUND");
            walletCoreService.validateAccountActive(account);

            if (account.currency !== currency) {
                throw new Error("CURRENCY_MISMATCH");
            }

            const balanceBefore = parseDecimal128ToNumber(account.available_balance_minor);
            const balanceAfter = balanceBefore + amount_minor;
            const netAmount = amount_minor - fee_minor;

            // Create transaction
            const transactionNumber = generateTransactionNumber();
            const [transaction] = await WalletTransactionModel.create(
                [
                    {
                        transaction_number: transactionNumber,
                        wallet_id,
                        user_id,
                        type,
                        status: "completed",
                        currency,
                        amount_minor: amount_minor.toString(),
                        fee_minor: fee_minor.toString(),
                        net_amount_minor: netAmount.toString(),
                        idempotency_key,
                        external_reference,
                        reference_type,
                        reference_id,
                        parent_transaction_id,
                        transfer_id,
                        description,
                        metadata,
                        completed_at: new Date(),
                    },
                ],
                { session }
            );

            // Create ledger entry (credit)
            const entryNumber = generateEntryNumber();
            await WalletLedgerEntryModel.create(
                [
                    {
                        entry_number: entryNumber,
                        transaction_id: transaction._id,
                        account_id,
                        user_id,
                        direction: "credit" as LedgerDirection,
                        amount_minor: amount_minor.toString(),
                        currency,
                        balance_before_minor: balanceBefore.toString(),
                        balance_after_minor: balanceAfter.toString(),
                        description,
                        reference_type,
                        reference_id,
                        metadata,
                        created_at: new Date(),
                    },
                ],
                { session }
            );

            // Atomically update balance
            const updated = await WalletAccountModel.findOneAndUpdate(
                {
                    _id: account_id,
                    status: "active",
                } as any,
                {
                    $inc: {
                        available_balance_minor: amount_minor,
                        version: 1,
                    },
                } as any,
                { returnDocument: 'after', session }
            );

            if (!updated) {
                throw new Error("BALANCE_UPDATE_FAILED");
            }

            return transaction;
        });
    }

    /**
     * Debit a wallet account.
     * Uses conditional atomic update to prevent concurrent double-spending.
     */
    async debit(params: {
        wallet_id: Types.ObjectId;
        account_id: Types.ObjectId;
        user_id: Types.ObjectId;
        amount_minor: number;
        currency: CurrencyCode;
        type: TransactionType;
        description?: string;
        idempotency_key?: string;
        external_reference?: string;
        reference_type?: string;
        reference_id?: Types.ObjectId;
        parent_transaction_id?: Types.ObjectId;
        transfer_id?: Types.ObjectId;
        metadata?: Record<string, unknown>;
        fee_minor?: number;
    }) {
        const {
            wallet_id, account_id, user_id, amount_minor, currency, type,
            description, idempotency_key, external_reference, reference_type,
            reference_id, parent_transaction_id, transfer_id, metadata,
            fee_minor = 0,
        } = params;

        validateAmount(amount_minor, currency);

        return withWalletTransaction(async (session) => {
            // Idempotency check
            if (idempotency_key) {
                const existing = await checkIdempotency(idempotency_key, session);
                if (existing) return existing;
            }

            // Validate wallet & account
            const wallet = await walletCoreService.getWalletById(wallet_id, session);
            walletCoreService.validateWalletActive(wallet);

            // Conditional atomic debit — prevents concurrent double-spending
            const updated = (await WalletAccountModel.findOneAndUpdate(
                {
                    _id: account_id,
                    status: "active",
                    is_deleted: false,
                    currency,
                    available_balance_minor: { $gte: amount_minor as any },
                } as any,
                {
                    $inc: {
                        available_balance_minor: -amount_minor,
                        version: 1,
                    },
                } as any,
                { returnDocument: 'before', session } // return pre-update doc for balance_before
            )) as any;

            if (!updated) {
                throw new Error("INSUFFICIENT_BALANCE");
            }

            if (updated.currency !== currency) {
                throw new Error("CURRENCY_MISMATCH");
            }

            const balanceBefore = parseDecimal128ToNumber(updated.available_balance_minor);
            const balanceAfter = balanceBefore - amount_minor;
            const netAmount = amount_minor - fee_minor;

            // Create transaction
            const transactionNumber = generateTransactionNumber();
            const [transaction] = await WalletTransactionModel.create(
                [
                    {
                        transaction_number: transactionNumber,
                        wallet_id,
                        user_id,
                        type,
                        status: "completed",
                        currency,
                        amount_minor: amount_minor.toString(),
                        fee_minor: fee_minor.toString(),
                        net_amount_minor: netAmount.toString(),
                        idempotency_key,
                        external_reference,
                        reference_type,
                        reference_id,
                        parent_transaction_id,
                        transfer_id,
                        description,
                        metadata,
                        completed_at: new Date(),
                    },
                ],
                { session }
            );

            // Create ledger entry (debit)
            const entryNumber = generateEntryNumber();
            await WalletLedgerEntryModel.create(
                [
                    {
                        entry_number: entryNumber,
                        transaction_id: transaction._id,
                        account_id,
                        user_id,
                        direction: "debit" as LedgerDirection,
                        amount_minor: amount_minor.toString(),
                        currency,
                        balance_before_minor: balanceBefore.toString(),
                        balance_after_minor: balanceAfter.toString(),
                        description,
                        reference_type,
                        reference_id,
                        metadata,
                        created_at: new Date(),
                    },
                ],
                { session }
            );

            return transaction;
        });
    }

    /**
     * Create a pending transaction (for deposits/withdrawals that need webhook confirmation).
     */
    async createPendingTransaction(params: {
        wallet_id: Types.ObjectId;
        user_id: Types.ObjectId;
        amount_minor: number;
        currency: CurrencyCode;
        type: TransactionType;
        description?: string;
        idempotency_key?: string;
        external_reference?: string;
        metadata?: Record<string, unknown>;
        fee_minor?: number;
    }, session?: ClientSession) {
        const {
            wallet_id, user_id, amount_minor, currency, type,
            description, idempotency_key, external_reference, metadata,
            fee_minor = 0,
        } = params;

        const netAmount = amount_minor - fee_minor;
        const transactionNumber = generateTransactionNumber();

        const [transaction] = await WalletTransactionModel.create(
            [
                {
                    transaction_number: transactionNumber,
                    wallet_id,
                    user_id,
                    type,
                    status: "pending",
                    currency,
                    amount_minor: amount_minor.toString(),
                    fee_minor: fee_minor.toString(),
                    net_amount_minor: netAmount.toString(),
                    idempotency_key,
                    external_reference,
                    description,
                    metadata,
                },
            ],
            session ? { session } : {}
        );

        return transaction;
    }
}

export default new WalletLedgerService();
