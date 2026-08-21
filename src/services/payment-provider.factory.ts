import { IPaymentProviderAdapter } from "@/resources/v1/user-wallets/interfaces/wallet.types";
import stripeWalletService from "./stripe/stripe-wallet.service";
import paypalWalletService from "./paypal/paypal-wallet.service";

/**
 * Payment provider factory.
 * Returns the correct provider adapter based on provider name.
 *
 * To add a new provider (e.g., Razorpay, Adyen):
 * 1. Create a new service implementing IPaymentProviderAdapter
 * 2. Add it to the providerMap below
 * 3. Add the provider name to the PaymentWebhookEvent provider enum
 *
 * That's it — all wallet services use the factory automatically.
 */

const providerMap: Record<string, IPaymentProviderAdapter> = {
    stripe: stripeWalletService,
    paypal: paypalWalletService,
};

/**
 * Get a payment provider adapter by name.
 * Throws if the provider is not supported.
 */
export function getPaymentProvider(provider: string): IPaymentProviderAdapter {
    const adapter = providerMap[provider.toLowerCase()];

    if (!adapter) {
        throw new Error(
            `Unsupported payment provider: ${provider}. ` +
            `Supported providers: ${Object.keys(providerMap).join(", ")}`
        );
    }

    return adapter;
}

/**
 * Get list of supported payment providers.
 */
export function getSupportedProviders(): string[] {
    return Object.keys(providerMap);
}
