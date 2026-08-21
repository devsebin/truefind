import { Types } from "mongoose";
import { CurrencyCode } from "@/database/user-wallet/user-wallet-db-interface";
import { WalletTransactionModel } from "@/database/user-wallet-transactions/user-wallet-transactions-db-model";
import { validateAmount, parseDecimal128ToNumber } from "../helpers/money.util";
import { checkIdempotency } from "../helpers/idempotency.util";
import walletCoreService from "./wallet-core.service";
import walletLedgerService from "./wallet-ledger.service";

/**
 * Refund service.
 * Creates a new refund transaction linked to the parent — never modifies the original.
 * Supports partial and full refunds.
 */
class WalletRefundService {
    /**
     * Create a refund for a completed transaction.
     */
    async create(params: {
        parent_transaction_id: Types.ObjectId;
        user_id: Types.ObjectId;
        amount_minor: number;
        currency: CurrencyCode;
        reason?: string;
        idempotency_key: string;
    }) {
        const {
            parent_transaction_id, user_id, amount_minor, currency,
            reason, idempotency_key,
        } = params;

        validateAmount(amount_minor, currency);

        // Idempotency check
        const existing = await checkIdempotency(idempotency_key);
        if (existing) return existing;

        // Validate parent transaction
        const parentTransaction = await WalletTransactionModel.findOne({
            _id: parent_transaction_id,
            status: "completed",
        });

        if (!parentTransaction) {
            throw new Error("PARENT_TRANSACTION_NOT_FOUND");
        }

        // Verify refund amount doesn't exceed original
        const originalAmount = parseDecimal128ToNumber(parentTransaction.amount_minor);

        // Check total refunds already issued for this parent
        const existingRefunds = await WalletTransactionModel.find({
            parent_transaction_id,
            type: "refund",
            status: { $in: ["completed", "pending", "processing"] },
        });

        const totalRefunded = existingRefunds.reduce(
            (sum, r) => sum + parseDecimal128ToNumber(r.amount_minor),
            0
        );

        if (totalRefunded + amount_minor > originalAmount) {
            throw new Error("REFUND_EXCEEDS_ORIGINAL");
        }

        // Get wallet & account
        const wallet = await walletCoreService.getWalletByUserId(user_id);
        const account = await walletCoreService.getAccountByCurrency(user_id, currency);

        // Credit the refund to the user's wallet
        const refundTransaction = await walletLedgerService.credit({
            wallet_id: wallet._id as Types.ObjectId,
            account_id: account._id as Types.ObjectId,
            user_id,
            amount_minor,
            currency,
            type: "refund",
            description: reason || "Refund for transaction " + parentTransaction.transaction_number,
            idempotency_key,
            parent_transaction_id,
            metadata: {
                original_transaction_number: parentTransaction.transaction_number,
                refund_reason: reason,
            },
        });

        return refundTransaction;
    }

    /**
     * List refunds for a user.
     */
    async listRefunds(userId: Types.ObjectId, page = 1, limit = 20) {
        const filter: any = { user_id: userId, type: "refund", is_deleted: false };
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
     * Get a single refund by ID.
     */
    async getRefund(refundId: Types.ObjectId, userId: Types.ObjectId) {
        const transaction = await WalletTransactionModel.findOne({
            _id: refundId,
            user_id: userId,
            type: "refund",
            is_deleted: false,
        }).lean();

        if (!transaction) throw new Error("REFUND_NOT_FOUND");
        return transaction;
    }
}

export default new WalletRefundService();
