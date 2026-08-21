import crypto from "crypto";
import { CurrencyCode } from "@/database/user-wallet/user-wallet-db-interface";
import { IPaymentProviderAdapter } from "@/resources/v1/user-wallets/interfaces/wallet.types";

/**
 * PayPal payment provider adapter for wallet operations.
 * Uses PayPal REST API v2 via fetch (no SDK needed).
 *
 * TODO: In production, move secrets to environment variables / secret manager.
 * This is a sample implementation demonstrating the integration pattern.
 */

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "paypal_client_placeholder";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "paypal_secret_placeholder";
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || "paypal_webhook_id_placeholder";

class PayPalWalletService implements IPaymentProviderAdapter {
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    /**
     * Get a PayPal access token (cached until expiry).
     */
    private async getAccessToken(): Promise<string> {
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

        const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        });

        if (!response.ok) {
            throw new Error(`PayPal auth failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        this.accessToken = data.access_token;
        // Token usually expires in ~9 hours; refresh 5 min early
        this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

        return this.accessToken!;
    }

    /**
     * Create a PayPal Order (for wallet deposits).
     * Returns the order ID and approval URL for user redirect.
     */
    async createPaymentIntent(params: {
        amount_minor: number;
        currency: CurrencyCode;
        metadata?: Record<string, unknown>;
    }) {
        const { amount_minor, currency, metadata } = params;
        const token = await this.getAccessToken();

        // Convert minor units to major units for PayPal
        const majorAmount = (amount_minor / 100).toFixed(2);

        const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: currency,
                            value: majorAmount,
                        },
                        custom_id: metadata ? JSON.stringify(metadata) : undefined,
                    },
                ],
                application_context: {
                    return_url: process.env.PAYPAL_RETURN_URL || "https://example.com/success",
                    cancel_url: process.env.PAYPAL_CANCEL_URL || "https://example.com/cancel",
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`PayPal order creation failed: ${errorText}`);
        }

        const order = await response.json();
        const approvalUrl = order.links?.find((l: any) => l.rel === "approve")?.href;

        return {
            provider_reference: order.id,
            redirect_url: approvalUrl,
        };
    }

    /**
     * Capture a PayPal Order (finalize payment after user approval).
     */
    async captureOrder(orderId: string) {
        const token = await this.getAccessToken();

        const response = await fetch(
            `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`PayPal order capture failed: ${errorText}`);
        }

        return response.json();
    }

    /**
     * Create a PayPal Payout (for provider withdrawals).
     */
    async createPayout(params: {
        amount_minor: number;
        currency: CurrencyCode;
        destination: string;
        metadata?: Record<string, unknown>;
    }) {
        const { amount_minor, currency, destination, metadata } = params;
        const token = await this.getAccessToken();

        const majorAmount = (amount_minor / 100).toFixed(2);

        const response = await fetch(`${PAYPAL_BASE_URL}/v1/payments/payouts`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sender_batch_header: {
                    sender_batch_id: `batch_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
                    email_subject: "You have a payout!",
                },
                items: [
                    {
                        recipient_type: "EMAIL",
                        amount: {
                            value: majorAmount,
                            currency: currency,
                        },
                        receiver: destination,
                        note: metadata?.description || "Wallet withdrawal payout",
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`PayPal payout creation failed: ${errorText}`);
        }

        const payout = await response.json();

        return {
            provider_reference: payout.batch_header?.payout_batch_id || payout.id,
        };
    }

    /**
     * Verify a PayPal webhook signature.
     *
     * Uses PayPal's verification endpoint to validate webhook authenticity.
     */
    async verifyWebhookSignature(params: {
        payload: string | Buffer;
        signature: string;
        secret: string;
    }) {
        const { payload, signature } = params;
        const token = await this.getAccessToken();

        // PayPal sends multiple header values for verification
        // The signature param here would be a JSON string of relevant headers
        let headers: Record<string, string> = {};
        try {
            headers = JSON.parse(signature);
        } catch {
            return { valid: false, event: null };
        }

        const response = await fetch(
            `${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    auth_algo: headers["paypal-auth-algo"],
                    cert_url: headers["paypal-cert-url"],
                    transmission_id: headers["paypal-transmission-id"],
                    transmission_sig: headers["paypal-transmission-sig"],
                    transmission_time: headers["paypal-transmission-time"],
                    webhook_id: PAYPAL_WEBHOOK_ID,
                    webhook_event: JSON.parse(payload.toString()),
                }),
            }
        );

        if (!response.ok) {
            return { valid: false, event: null };
        }

        const result = await response.json();
        const valid = result.verification_status === "SUCCESS";

        return {
            valid,
            event: valid ? JSON.parse(payload.toString()) : null,
        };
    }
}

export default new PayPalWalletService();
