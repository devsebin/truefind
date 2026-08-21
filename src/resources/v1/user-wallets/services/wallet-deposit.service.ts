import { Types } from "mongoose";
import { CurrencyCode } from "@/database/user-wallet/user-wallet-db-interface";
import { validateAmount } from "../helpers/money.util";
import { checkIdempotency } from "../helpers/idempotency.util";
import walletCoreService from "./wallet-core.service";
import walletLedgerService from "./wallet-ledger.service";
import { getPaymentProvider } from "@/services/payment-provider.factory";

/**
 * Deposit service.
 * Flow: Create payment intent → Provider processes → Webhook confirms → Credit wallet.
 * NEVER credits wallet from frontend — only from verified webhooks.
 */
class WalletDepositService {
    /**
     * Initiate a deposit: creates a pending transaction and a payment intent with the provider.
     * The actual wallet credit happens in webhookComplete() after provider confirmation.
     */
    async initiate(params: {
        user_id: Types.ObjectId;
        amount_minor: number;
        currency: CurrencyCode;
        provider: "stripe" | "paypal";
        idempotency_key: string;
        description?: string;
        metadata?: Record<string, unknown>;
    }) {
        const {
            user_id, amount_minor, currency, provider,
            idempotency_key, description, metadata,
        } = params;

        validateAmount(amount_minor, currency);

        // Idempotency check — return existing if duplicate
        const existing = await checkIdempotency(idempotency_key);
        if (existing) return { transaction: existing, provider_data: null };

        // Ensure wallet & account exist
        const wallet = await walletCoreService.getOrCreateWallet(user_id, currency);
        walletCoreService.validateWalletActive(wallet);
        const account = await walletCoreService.getOrCreateAccount(
            wallet._id as Types.ObjectId,
            user_id,
            currency
        );

        // Create payment intent with provider
        const providerService = getPaymentProvider(provider);
        const paymentResult = await providerService.createPaymentIntent({
            amount_minor,
            currency,
            metadata: {
                user_id: user_id.toString(),
                wallet_id: (wallet._id as Types.ObjectId).toString(),
                account_id: (account._id as Types.ObjectId).toString(),
                ...metadata,
            },
        });

        // Create pending transaction (not yet credited)
        const transaction = await walletLedgerService.createPendingTransaction({
            wallet_id: wallet._id as Types.ObjectId,
            user_id,
            amount_minor,
            currency,
            type: "deposit",
            description: description || "Wallet deposit",
            idempotency_key,
            external_reference: paymentResult.provider_reference,
            metadata: {
                provider,
                ...metadata,
            },
        });

        return {
            transaction,
            provider_data: {
                provider_reference: paymentResult.provider_reference,
                client_secret: paymentResult.client_secret,
                redirect_url: paymentResult.redirect_url,
            },
        };
    }

    /**
     * Complete a deposit after webhook confirmation.
     * This is where the wallet actually gets credited.
     */
    async webhookComplete(params: {
        external_reference: string;
        provider: string;
    }) {
        const { external_reference, provider } = params;

        // Find the pending deposit transaction
        const { WalletTransactionModel } = await import(
            "@/database/user-wallet-transactions/user-wallet-transactions-db-model"
        );

        const transaction = await WalletTransactionModel.findOne({
            external_reference,
            type: "deposit",
            status: "pending",
        });

        if (!transaction) {
            throw new Error("DEPOSIT_TRANSACTION_NOT_FOUND");
        }

        const amountMinor = parseInt(transaction.amount_minor.toString(), 10);

        // Find the user's wallet account
        const wallet = await walletCoreService.getWalletById(
            transaction.wallet_id as Types.ObjectId
        );
        const account = await walletCoreService.getOrCreateAccount(
            wallet._id as Types.ObjectId,
            transaction.user_id as Types.ObjectId,
            transaction.currency as CurrencyCode
        );

        // Now credit the wallet atomically
        const completedTransaction = await walletLedgerService.credit({
            wallet_id: wallet._id as Types.ObjectId,
            account_id: account._id as Types.ObjectId,
            user_id: transaction.user_id as Types.ObjectId,
            amount_minor: amountMinor,
            currency: transaction.currency as CurrencyCode,
            type: "deposit",
            description: "Deposit confirmed by payment provider",
            external_reference,
            metadata: { provider, original_transaction_id: transaction._id },
        });

        // Mark original pending transaction as completed
        transaction.status = "completed";
        transaction.completed_at = new Date();
        await transaction.save();

        return completedTransaction;
    }

    /**
     * Get a deposit transaction by ID.
     */
    async getDeposit(depositId: Types.ObjectId, userId: Types.ObjectId) {
        const { WalletTransactionModel } = await import(
            "@/database/user-wallet-transactions/user-wallet-transactions-db-model"
        );

        const deposit = await WalletTransactionModel.findOne({
            _id: depositId,
            user_id: userId,
            type: "deposit",
            is_deleted: false,
        }).lean();

        if (!deposit) {
            throw new Error("DEPOSIT_NOT_FOUND");
        }

        return deposit;
    }
}

export default new WalletDepositService();
