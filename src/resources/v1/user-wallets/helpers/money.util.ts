import { CurrencyCode } from "@/database/user-wallet/user-wallet-db-interface";

// ─── Currency Configuration ──────────────────────────────────────

/**
 * Number of decimal places (exponent) for each supported currency.
 * Most currencies use 2 (cents/paise), but this map is extensible
 * for currencies with 0 or 3 decimal places.
 */
const CURRENCY_EXPONENTS: Record<CurrencyCode, number> = {
    INR: 2,
    NZD: 2,
    USD: 2,
    AUD: 2,
    GBP: 2,
};

/**
 * Maximum allowed amount in minor units per single transaction.
 * Default: 10,000,000 major units (e.g. ₹1,00,00,000 / $10,000,000).
 */
const MAX_AMOUNT_MINOR: Record<CurrencyCode, number> = {
    INR: 1_000_000_000, // ₹1,00,00,000.00
    NZD: 1_000_000_00,  // $1,000,000.00
    USD: 1_000_000_00,  // $1,000,000.00
    AUD: 1_000_000_00,  // $1,000,000.00
    GBP: 1_000_000_00,  // £1,000,000.00
};

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
    INR: "₹",
    NZD: "NZ$",
    USD: "$",
    AUD: "A$",
    GBP: "£",
};

// ─── Public API ──────────────────────────────────────────────────

/**
 * Get the exponent (number of decimal places) for a currency.
 */
export function getCurrencyExponent(currency: CurrencyCode): number {
    const exp = CURRENCY_EXPONENTS[currency];
    if (exp === undefined) {
        throw new Error(`Unsupported currency: ${currency}`);
    }
    return exp;
}

/**
 * Convert a major-unit amount (e.g. 100.50) to minor units (e.g. 10050).
 * Uses integer arithmetic to avoid floating-point errors.
 */
export function toMinorUnits(majorAmount: number, currency: CurrencyCode): number {
    const exponent = getCurrencyExponent(currency);
    const multiplier = Math.pow(10, exponent);

    // Round to avoid floating-point precision issues
    const result = Math.round(majorAmount * multiplier);

    if (!Number.isInteger(result) || !Number.isSafeInteger(result)) {
        throw new Error(
            `Amount conversion resulted in unsafe integer for ${currency}: ${majorAmount}`
        );
    }

    return result;
}

/**
 * Convert minor units (e.g. 10050) back to major units (e.g. 100.50).
 * Only for display/formatting — never for arithmetic.
 */
export function fromMinorUnits(minorAmount: number, currency: CurrencyCode): number {
    const exponent = getCurrencyExponent(currency);
    return minorAmount / Math.pow(10, exponent);
}

/**
 * Format a minor-unit amount into a display string.
 * Example: formatMoney(10050, 'INR') → "₹100.50"
 */
export function formatMoney(minorAmount: number, currency: CurrencyCode): string {
    const major = fromMinorUnits(minorAmount, currency);
    const exponent = getCurrencyExponent(currency);
    const symbol = CURRENCY_SYMBOLS[currency] || currency;

    return `${symbol}${major.toFixed(exponent)}`;
}

/**
 * Validate that a minor-unit amount is a positive integer.
 */
export function validatePositiveAmount(amountMinor: number): void {
    if (!Number.isInteger(amountMinor)) {
        throw new Error("Amount must be an integer (minor units)");
    }
    if (amountMinor <= 0) {
        throw new Error("Amount must be positive");
    }
    if (!Number.isSafeInteger(amountMinor)) {
        throw new Error("Amount exceeds safe integer range");
    }
}

/**
 * Validate that a minor-unit amount is zero or positive.
 */
export function validateNonNegativeAmount(amountMinor: number): void {
    if (!Number.isInteger(amountMinor)) {
        throw new Error("Amount must be an integer (minor units)");
    }
    if (amountMinor < 0) {
        throw new Error("Amount must be zero or positive");
    }
    if (!Number.isSafeInteger(amountMinor)) {
        throw new Error("Amount exceeds safe integer range");
    }
}

/**
 * Validate amount does not exceed the maximum for the currency.
 */
export function validateMaxAmount(amountMinor: number, currency: CurrencyCode): void {
    const max = MAX_AMOUNT_MINOR[currency];
    if (max !== undefined && amountMinor > max) {
        throw new Error(
            `Amount ${formatMoney(amountMinor, currency)} exceeds maximum allowed ${formatMoney(max, currency)}`
        );
    }
}

/**
 * Run all standard validations on an amount.
 */
export function validateAmount(amountMinor: number, currency: CurrencyCode): void {
    validatePositiveAmount(amountMinor);
    validateMaxAmount(amountMinor, currency);
}

/**
 * Parse a Decimal128 value to a number (for minor units stored as Decimal128).
 */
export function parseDecimal128ToNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") return parseInt(value, 10);
    // Mongoose Decimal128
    if (value.toString) return parseInt(value.toString(), 10);
    return 0;
}
