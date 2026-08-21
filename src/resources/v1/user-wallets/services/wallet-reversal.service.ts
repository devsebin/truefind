import { Types } from "mongoose";
import { CurrencyCode } from "@/database/user-wallet/user-wallet-db-interface";
import { WalletTransactionModel } from "@/database/user-wallet-transactions/user-wallet-transactions-db-model";
import { validateAmount, parseDecimal128ToNumber } from "../helpers/money.util";
import { checkIdempotency } from "../helpers/idempotency.util";
import { validateTransactionTransition } from "../helpers/transaction-state-machine.util";
import walletCoreService from "./wallet-core.service";
import walletLedgerService from "./wallet-ledger.service";

/**
 * Reversal service.
 * Handles provider-initiated reversals (chargebacks, failed deposits, etc.).
 * Creates a new reversal transaction linked to the parent — never modifies the original.
 */
class WalletReversalService {
    /**
     * Create a reversal for a completed transaction.
     * Typically triggered by a provider webhook (chargeback, payment failure).
     */
    async create(params: {
        parent_transaction_id: Types.ObjectId;
        user_id: Types.ObjectId;
        amount_minor: number;
        currency: CurrencyCode;
        reason?: string;
        external_reference?: string;
        idempotency_key?: string;
    }) {
        const {
            parent_transaction_id, user_id, amount_minor, currency,
            reason, external_reference, idempotency_key,
        } = params;

        validateAmount(amount_minor, currency);

        // Idempotency check
        if (idempotency_key) {
            const existing = await checkIdempotency(idempotency_key);
            if (existing) return existing;
        }

        // Validate parent transaction exists and is completed
        const parentTransaction = await WalletTransactionModel.findOne({
            _id: parent_transaction_id,
            status: "completed",
        });

        if (!parentTransaction) {
            throw new Error("PARENT_TRANSACTION_NOT_FOUND");
        }

        // Validate state transition (completed → reversed)
        validateTransactionTransition(parentTransaction.status as any, "reversed");

        // Verify reversal amount doesn't exceed original
        const originalAmount = parseDecimal128ToNumber(parentTransaction.amount_minor);
        if (amount_minor > originalAmount) {
            throw new Error("REVERSAL_EXCEEDS_ORIGINAL");
        }

        // Get wallet & account
        const wallet = await walletCoreService.getWalletByUserId(user_id);
        const account = await walletCoreService.getAccountByCurrency(user_id, currency);

        // For a deposit reversal, we debit the wallet (undo the credit)
        // For a purchase reversal (by the platform/provider), we credit back
        const isDeposit = parentTransaction.type === "deposit" || parentTransaction.type === "cashback";

        let reversalTransaction;

        if (isDeposit) {
            // Reverse a deposit = debit the user's wallet
            reversalTransaction = await walletLedgerService.debit({
                wallet_id: wallet._id as Types.ObjectId,
                account_id: account._id as Types.ObjectId,
                user_id,
                amount_minor,
                currency,
                type: "reversal",
                description: reason || `Reversal of ${parentTransaction.transaction_number}`,
                idempotency_key,
                external_reference,
                parent_transaction_id,
                metadata: {
                    original_transaction_number: parentTransaction.transaction_number,
                    original_type: parentTransaction.type,
                    reversal_reason: reason,
                },
            });
        } else {
            // Reverse a debit-type transaction = credit the user's wallet
            reversalTransaction = await walletLedgerService.credit({
                wallet_id: wallet._id as Types.ObjectId,
                account_id: account._id as Types.ObjectId,
                user_id,
                amount_minor,
                currency,
                type: "reversal",
                description: reason || `Reversal of ${parentTransaction.transaction_number}`,
                idempotency_key,
                external_reference,
                parent_transaction_id,
                metadata: {
                    original_transaction_number: parentTransaction.transaction_number,
                    original_type: parentTransaction.type,
                    reversal_reason: reason,
                },
            });
        }

        // Mark original as reversed
        parentTransaction.status = "reversed";
        await parentTransaction.save();

        return reversalTransaction;
    }

    /**
     * List reversals for a user.
     */
    async listReversals(userId: Types.ObjectId, page = 1, limit = 20) {
        const filter: any = { user_id: userId, type: "reversal", is_deleted: false };
        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            WalletTransactionModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            WalletTransactionModel.countDocuments(filter),
        ]);

        return {
            transactions,
            pagination: {
                page, limit, total,
                total_pages: Math.ceil(total / limit),
                has_next: page * limit < total,
                has_prev: page > 1,
            },
        };
    }

    /**
     * Get a single reversal by ID.
     */
    async getReversal(reversalId: Types.ObjectId, userId: Types.ObjectId) {
        const transaction = await WalletTransactionModel.findOne({
            _id: reversalId,
            user_id: userId,
            type: "reversal",
            is_deleted: false,
        }).lean();

        if (!transaction) throw new Error("REVERSAL_NOT_FOUND");
        return transaction;
    }
}

export default new WalletReversalService();
