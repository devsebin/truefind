import { Types } from "mongoose";
import { PaymentWebhookEventModel } from "@/database/user-wallet-webhooks/user-wallet-webhooks-db-model";
import { getPaymentProvider } from "@/services/payment-provider.factory";
import walletDepositService from "./wallet-deposit.service";
import walletWithdrawalService from "./wallet-withdrawal.service";
import walletReversalService from "./wallet-reversal.service";

/**
 * Core webhook processing service.
 * Flow: Verify signature → Check duplicate → Persist event → Process → Mark done.
 * All webhook events are idempotent — duplicate events are safely ignored.
 */
class WebhookService {
    /**
     * Process a webhook event from a payment provider.
     */
    async processWebhook(params: {
        provider: "stripe" | "paypal";
        payload: string | Buffer;
        signature: string;
        headers?: Record<string, string>;
    }) {
        const { provider, payload, signature, headers } = params;

        // 1. Verify webhook signature
        const providerService = getPaymentProvider(provider);
        const webhookSecret = this.getWebhookSecret(provider);

        const verification = await providerService.verifyWebhookSignature({
            payload,
            signature,
            secret: webhookSecret,
        });

        if (!verification.valid || !verification.event) {
            throw new Error("WEBHOOK_SIGNATURE_INVALID");
        }

        const event = verification.event;
        const eventId = this.extractEventId(provider, event);
        const eventType = this.extractEventType(provider, event);

        // 2. Check for duplicate (idempotent)
        const existing = await PaymentWebhookEventModel.findOne({
            provider,
            event_id: eventId,
        });

        if (existing && existing.status === "processed") {
            // Already processed — return success without re-processing
            return { status: "already_processed", event_id: eventId };
        }

        // 3. Persist webhook event
        let webhookEvent;
        if (existing) {
            webhookEvent = existing;
            webhookEvent.attempts += 1;
            webhookEvent.status = "processing";
            await webhookEvent.save();
        } else {
            webhookEvent = await PaymentWebhookEventModel.create({
                provider,
                event_id: eventId,
                event_type: eventType,
                status: "processing",
                attempts: 1,
                received_at: new Date(),
            });
        }

        // 4. Dispatch to the correct handler
        try {
            const result = await this.dispatchEvent(provider, eventType, event);

            // 5. Mark as processed
            webhookEvent.status = "processed";
            webhookEvent.processed_at = new Date();
            if (result?.transaction_id) {
                webhookEvent.transaction_id = result.transaction_id;
            }
            await webhookEvent.save();

            return { status: "processed", event_id: eventId, result };
        } catch (error) {
            // Mark as failed
            webhookEvent.status = "failed";
            webhookEvent.failure_reason = (error as Error).message;
            await webhookEvent.save();

            throw error;
        }
    }

    /**
     * Dispatch a webhook event to the appropriate handler based on event type.
     */
    private async dispatchEvent(
        provider: string,
        eventType: string,
        event: any
    ): Promise<{ transaction_id?: Types.ObjectId } | null> {
        // Normalize event types across providers
        const normalizedType = this.normalizeEventType(provider, eventType);

        switch (normalizedType) {
            case "payment.succeeded": {
                const reference = this.extractPaymentReference(provider, event);
                const result = await walletDepositService.webhookComplete({
                    external_reference: reference,
                    provider,
                });
                return { transaction_id: result._id as Types.ObjectId };
            }

            case "payout.succeeded": {
                const reference = this.extractPayoutReference(provider, event);
                const result = await walletWithdrawalService.webhookSuccess(reference);
                return { transaction_id: result._id as Types.ObjectId };
            }

            case "payout.failed": {
                const reference = this.extractPayoutReference(provider, event);
                const failureReason = this.extractFailureReason(provider, event);
                const result = await walletWithdrawalService.webhookFailure(
                    reference,
                    failureReason
                );
                return { transaction_id: result._id as Types.ObjectId };
            }

            case "payment.refunded":
            case "charge.dispute.created": {
                // Reversals handled separately — log for now
                // TODO: Implement automatic reversal processing
                console.warn(`[Webhook] Received ${normalizedType} — manual review may be needed`);
                return null;
            }

            default:
                // Unknown event type — log but don't fail
                console.warn(`[Webhook] Unhandled event type: ${eventType} (${provider})`);
                return null;
        }
    }

    /**
     * Normalize provider-specific event types to a common format.
     */
    private normalizeEventType(provider: string, eventType: string): string {
        const typeMap: Record<string, Record<string, string>> = {
            stripe: {
                "payment_intent.succeeded": "payment.succeeded",
                "payment_intent.payment_failed": "payment.failed",
                "payout.paid": "payout.succeeded",
                "payout.failed": "payout.failed",
                "charge.refunded": "payment.refunded",
                "charge.dispute.created": "charge.dispute.created",
            },
            paypal: {
                "PAYMENT.CAPTURE.COMPLETED": "payment.succeeded",
                "PAYMENT.CAPTURE.DENIED": "payment.failed",
                "PAYMENT.PAYOUTS-ITEM.SUCCEEDED": "payout.succeeded",
                "PAYMENT.PAYOUTS-ITEM.FAILED": "payout.failed",
                "PAYMENT.CAPTURE.REFUNDED": "payment.refunded",
                "CUSTOMER.DISPUTE.CREATED": "charge.dispute.created",
            },
        };

        return typeMap[provider]?.[eventType] || eventType;
    }

    /**
     * Extract the event ID from provider-specific event payloads.
     */
    private extractEventId(provider: string, event: any): string {
        switch (provider) {
            case "stripe":
                return event.id;
            case "paypal":
                return event.id;
            default:
                return event.id || `unknown-${Date.now()}`;
        }
    }

    /**
     * Extract the event type from provider-specific event payloads.
     */
    private extractEventType(provider: string, event: any): string {
        switch (provider) {
            case "stripe":
                return event.type;
            case "paypal":
                return event.event_type;
            default:
                return event.type || event.event_type || "unknown";
        }
    }

    /**
     * Extract the payment reference (e.g., PaymentIntent ID) from an event.
     */
    private extractPaymentReference(provider: string, event: any): string {
        switch (provider) {
            case "stripe":
                return event.data?.object?.id;
            case "paypal":
                return event.resource?.supplementary_data?.related_ids?.order_id ||
                    event.resource?.id;
            default:
                return event.data?.object?.id || event.resource?.id;
        }
    }

    /**
     * Extract the payout reference from an event.
     */
    private extractPayoutReference(provider: string, event: any): string {
        switch (provider) {
            case "stripe":
                return event.data?.object?.id;
            case "paypal":
                return event.resource?.payout_batch_id || event.resource?.id;
            default:
                return event.data?.object?.id || event.resource?.id;
        }
    }

    /**
     * Extract failure reason from an event.
     */
    private extractFailureReason(provider: string, event: any): string {
        switch (provider) {
            case "stripe":
                return event.data?.object?.failure_message ||
                    event.data?.object?.last_payment_error?.message ||
                    "Unknown failure";
            case "paypal":
                return event.resource?.payout_item?.errors?.message ||
                    event.summary || "Unknown failure";
            default:
                return "Unknown failure";
        }
    }

    /**
     * Get the webhook secret for a provider from environment.
     */
    private getWebhookSecret(provider: string): string {
        const secrets: Record<string, string> = {
            stripe: process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder",
            paypal: process.env.PAYPAL_WEBHOOK_SECRET || "paypal_webhook_secret_placeholder",
        };

        return secrets[provider] || "";
    }
}

export default new WebhookService();
