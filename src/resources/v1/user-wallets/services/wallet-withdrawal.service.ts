import { Types } from "mongoose";
import { CurrencyCode } from "@/database/user-wallet/user-wallet-db-interface";
import { WalletTransactionModel } from "@/database/user-wallet-transactions/user-wallet-transactions-db-model";
import { validateAmount } from "../helpers/money.util";
import { checkIdempotency } from "../helpers/idempotency.util";
import walletCoreService from "./wallet-core.service";
import walletHoldService from "./wallet-hold.service";
import walletLedgerService from "./wallet-ledger.service";
import { getPaymentProvider } from "@/services/payment-provider.factory";

/**
 * Withdrawal service.
 * Flow: Validate → Hold funds → Create payout → Webhook success/failure → Capture/Release hold.
 */
class WalletWithdrawalService {
    /**
     * Request a withdrawal.
     * Locks the funds and initiates a payout with the payment provider.
     */
    async request(params: {
        user_id: Types.ObjectId;
        amount_minor: number;
        currency: CurrencyCode;
        provider: "stripe" | "paypal";
        payout_destination: string;
        idempotency_key: string;
        description?: string;
    }) {
        const {
            user_id, amount_minor, currency, provider,
            payout_destination, idempotency_key, description,
        } = params;

        validateAmount(amount_minor, currency);

        // Idempotency check
        const existing = await checkIdempotency(idempotency_key);
        if (existing) return { transaction: existing, provider_data: null };

        // Get wallet & account
        const wallet = await walletCoreService.getWalletByUserId(user_id);
        walletCoreService.validateWalletActive(wallet);
        const account = await walletCoreService.getAccountByCurrency(user_id, currency);
        walletCoreService.validateAccountActive(account);

        // Create hold (moves available → locked)
        const hold = await walletHoldService.createHold({
            wallet_account_id: account._id as Types.ObjectId,
            user_id,
            amount_minor,
            currency,
            reference_type: "withdrawal",
            reference_id: wallet._id as Types.ObjectId,
        });

        // Create pending withdrawal transaction
        const transaction = await walletLedgerService.createPendingTransaction({
            wallet_id: wallet._id as Types.ObjectId,
            user_id,
            amount_minor,
            currency,
            type: "withdrawal",
            description: description || "Wallet withdrawal",
            idempotency_key,
            metadata: {
                provider,
                hold_id: (hold._id as Types.ObjectId).toString(),
                payout_destination,
            },
        });

        // Update hold with transaction reference
        hold.transaction_id = transaction._id as Types.ObjectId;
        await hold.save();

        // Initiate payout with provider
        try {
            const providerService = getPaymentProvider(provider);
            const payoutResult = await providerService.createPayout({
                amount_minor,
                currency,
                destination: payout_destination,
                metadata: {
                    user_id: user_id.toString(),
                    transaction_id: (transaction._id as Types.ObjectId).toString(),
                    hold_id: (hold._id as Types.ObjectId).toString(),
                },
            });

            // Update transaction with provider reference
            transaction.external_reference = payoutResult.provider_reference;
            transaction.status = "processing";
            transaction.processed_at = new Date();
            await transaction.save();

            return {
                transaction,
                hold,
                provider_data: {
                    provider_reference: payoutResult.provider_reference,
                },
            };
        } catch (error) {
            // If payout initiation fails, release the hold
            await walletHoldService.releaseHold({
                hold_id: hold._id as Types.ObjectId,
                user_id,
                reason: "Payout initiation failed",
            });

            transaction.status = "failed";
            transaction.failure_code = "PAYOUT_INITIATION_FAILED";
            transaction.failure_reason = (error as Error).message;
            await transaction.save();

            throw error;
        }
    }

    /**
     * Complete withdrawal after successful payout webhook.
     * Captures the hold (deducts locked funds permanently).
     */
    async webhookSuccess(externalReference: string) {
        const transaction = await WalletTransactionModel.findOne({
            external_reference: externalReference,
            type: "withdrawal",
            status: "processing",
        });

        if (!transaction) {
            throw new Error("WITHDRAWAL_TRANSACTION_NOT_FOUND");
        }

        const holdId = (transaction.metadata as any)?.hold_id;
        if (holdId) {
            await walletHoldService.captureHold({
                hold_id: new Types.ObjectId(holdId),
                user_id: transaction.user_id as Types.ObjectId,
                description: "Withdrawal payout completed",
            });
        }

        transaction.status = "completed";
        transaction.completed_at = new Date();
        await transaction.save();

        return transaction;
    }

    /**
     * Handle withdrawal failure webhook.
     * Releases the hold (returns locked funds to available).
     */
    async webhookFailure(externalReference: string, failureReason?: string) {
        const transaction = await WalletTransactionModel.findOne({
            external_reference: externalReference,
            type: "withdrawal",
            status: "processing",
        });

        if (!transaction) {
            throw new Error("WITHDRAWAL_TRANSACTION_NOT_FOUND");
        }

        const holdId = (transaction.metadata as any)?.hold_id;
        if (holdId) {
            await walletHoldService.releaseHold({
                hold_id: new Types.ObjectId(holdId),
                user_id: transaction.user_id as Types.ObjectId,
                reason: failureReason || "Withdrawal payout failed",
            });
        }

        transaction.status = "failed";
        transaction.failure_code = "PAYOUT_FAILED";
        transaction.failure_reason = failureReason || "Provider payout failed";
        await transaction.save();

        return transaction;
    }

    /**
     * Cancel a pending withdrawal (before provider processing).
     */
    async cancel(withdrawalId: Types.ObjectId, userId: Types.ObjectId) {
        const transaction = await WalletTransactionModel.findOne({
            _id: withdrawalId,
            user_id: userId,
            type: "withdrawal",
            status: { $in: ["pending", "processing"] },
        });

        if (!transaction) {
            throw new Error("WITHDRAWAL_NOT_FOUND_OR_NOT_CANCELLABLE");
        }

        const holdId = (transaction.metadata as any)?.hold_id;
        if (holdId) {
            await walletHoldService.releaseHold({
                hold_id: new Types.ObjectId(holdId),
                user_id: userId,
                reason: "Withdrawal cancelled by user",
            });
        }

        transaction.status = "cancelled";
        await transaction.save();

        return transaction;
    }

    /**
     * List withdrawals for a user.
     */
    async listWithdrawals(userId: Types.ObjectId, page = 1, limit = 20) {
        const filter: any = { user_id: userId, type: "withdrawal", is_deleted: false };
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
     * Get a single withdrawal by ID.
     */
    async getWithdrawal(withdrawalId: Types.ObjectId, userId: Types.ObjectId) {
        const transaction = await WalletTransactionModel.findOne({
            _id: withdrawalId,
            user_id: userId,
            type: "withdrawal",
            is_deleted: false,
        }).lean();

        if (!transaction) throw new Error("WITHDRAWAL_NOT_FOUND");
        return transaction;
    }
}

export default new WalletWithdrawalService();
