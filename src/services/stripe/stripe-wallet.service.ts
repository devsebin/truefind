import Stripe from "stripe";
import { CurrencyCode } from "@/database/user-wallet/user-wallet-db-interface";
import { IPaymentProviderAdapter } from "@/resources/v1/user-wallets/interfaces/wallet.types";

/**
 * Stripe payment provider adapter for wallet operations.
 *
 * TODO: In production, move secrets to environment variables / secret manager.
 * This is a sample implementation demonstrating the integration pattern.
 */

// Initialize Stripe SDK — use env variable in production
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    apiVersion: "2025-04-30.basil" as any,
});

class StripeWalletService implements IPaymentProviderAdapter {
    /**
     * Create a Stripe PaymentIntent for wallet deposits.
     * Returns the client_secret for frontend-side payment confirmation.
     */
    async createPaymentIntent(params: {
        amount_minor: number;
        currency: CurrencyCode;
        metadata?: Record<string, unknown>;
    }) {
        const { amount_minor, currency, metadata } = params;

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount_minor,
                currency: currency.toLowerCase(),
                metadata: metadata as Record<string, string> || {},
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return {
                provider_reference: paymentIntent.id,
                client_secret: paymentIntent.client_secret || undefined,
            };
        } catch (error) {
            console.log(error)
            throw new Error(
                `Stripe PaymentIntent creation failed: ${(error as Error).message}`
            );
        }
    }

    /**
     * Create a Stripe Payout (for provider withdrawals).
     * Requires a connected Stripe account or bank account destination.
     *
     * TODO: In production, implement proper connected account handling.
     */
    async createPayout(params: {
        amount_minor: number;
        currency: CurrencyCode;
        destination: string;
        metadata?: Record<string, unknown>;
    }) {
        const { amount_minor, currency, destination, metadata } = params;

        try {
            // For connected accounts, use transfers; for bank payouts, use payouts
            const payout = await stripe.payouts.create({
                amount: amount_minor,
                currency: currency.toLowerCase(),
                destination,
                metadata: metadata as Record<string, string> || {},
            });

            return {
                provider_reference: payout.id,
            };
        } catch (error) {
            throw new Error(
                `Stripe Payout creation failed: ${(error as Error).message}`
            );
        }
    }

    /**
     * Verify a Stripe webhook signature and extract the event.
     *
     * IMPORTANT: The raw request body must be passed as a Buffer/string,
     * not a parsed JSON object.
     */
    async verifyWebhookSignature(params: {
        payload: string | Buffer;
        signature: string;
        secret: string;
    }) {
        const { payload, signature, secret } = params;

        try {
            const event = stripe.webhooks.constructEvent(
                payload,
                signature,
                secret
            );

            return {
                valid: true,
                event,
            };
        } catch (error) {
            return {
                valid: false,
                event: null,
            };
        }
    }

    /**
     * Retrieve a PaymentIntent to check its status.
     */
    async getPaymentIntent(paymentIntentId: string) {
        try {
            return await stripe.paymentIntents.retrieve(paymentIntentId);
        } catch (error) {
            throw new Error(
                `Stripe PaymentIntent retrieval failed: ${(error as Error).message}`
            );
        }
    }

    /**
     * Create a refund through Stripe.
     */
    async createRefund(params: {
        payment_intent_id: string;
        amount_minor?: number;
        reason?: string;
    }) {
        const { payment_intent_id, amount_minor, reason } = params;

        try {
            const refund = await stripe.refunds.create({
                payment_intent: payment_intent_id,
                amount: amount_minor, // undefined = full refund
                reason: (reason as any) || "requested_by_customer",
            });

            return {
                provider_reference: refund.id,
                status: refund.status,
            };
        } catch (error) {
            throw new Error(
                `Stripe Refund creation failed: ${(error as Error).message}`
            );
        }
    }
}

export default new StripeWalletService();
