import { TransactionStatus } from "@/database/user-wallet-transactions/user-wallet-transactions-db-interface";

/**
 * Valid state transitions for wallet transactions.
 *
 * pending     → processing, cancelled, failed
 * processing  → completed, failed
 * completed   → reversed
 * failed      → (terminal)
 * cancelled   → (terminal)
 * reversed    → (terminal)
 */
const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
    pending: ["processing", "cancelled", "failed"],
    processing: ["completed", "failed"],
    completed: ["reversed"],
    failed: [],
    cancelled: [],
    reversed: [],
};

/**
 * Validate that a transaction status transition is allowed.
 * Throws an error if the transition is invalid.
 */
export function validateTransactionTransition(
    currentStatus: TransactionStatus,
    nextStatus: TransactionStatus
): void {
    const allowed = VALID_TRANSITIONS[currentStatus];
    if (!allowed) {
        throw new Error(
            `Unknown transaction status: ${currentStatus}`
        );
    }

    if (!allowed.includes(nextStatus)) {
        throw new Error(
            `Invalid transaction transition: ${currentStatus} → ${nextStatus}. ` +
            `Allowed transitions from '${currentStatus}': [${allowed.join(", ")}]`
        );
    }
}

/**
 * Check if a transition is valid without throwing.
 */
export function isValidTransition(
    currentStatus: TransactionStatus,
    nextStatus: TransactionStatus
): boolean {
    const allowed = VALID_TRANSITIONS[currentStatus];
    if (!allowed) return false;
    return allowed.includes(nextStatus);
}

/**
 * Check if a status is terminal (no further transitions possible).
 */
export function isTerminalStatus(status: TransactionStatus): boolean {
    const allowed = VALID_TRANSITIONS[status];
    return !allowed || allowed.length === 0;
}
