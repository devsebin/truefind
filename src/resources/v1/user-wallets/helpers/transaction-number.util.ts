import crypto from "crypto";

/**
 * Generate a unique transaction number.
 * Format: TXN-{timestamp}-{random}
 */
export function generateTransactionNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `TXN-${timestamp}-${random}`;
}

/**
 * Generate a unique ledger entry number.
 * Format: LED-{timestamp}-{random}
 */
export function generateEntryNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `LED-${timestamp}-${random}`;
}

/**
 * Generate a unique transfer number.
 * Format: TRF-{timestamp}-{random}
 */
export function generateTransferNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `TRF-${timestamp}-${random}`;
}

/**
 * Generate a unique wallet number.
 * Format: WLT-{timestamp}-{random}
 */
export function generateWalletNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `WLT-${timestamp}-${random}`;
}

/**
 * Generate a unique adjustment number.
 * Format: ADJ-{timestamp}-{random}
 */
export function generateAdjustmentNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `ADJ-${timestamp}-${random}`;
}
