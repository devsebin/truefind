import { WalletTransactionModel } from "@/database/user-wallet-transactions/user-wallet-transactions-db-model";
import { ClientSession } from "mongoose";

/**
 * Check if a transaction with the given idempotency key already exists.
 * If it does, return the existing transaction so the caller can
 * return a cached result instead of creating a duplicate.
 *
 * @returns The existing transaction document, or null if no duplicate.
 */
export async function checkIdempotency(
    idempotencyKey: string,
    session?: ClientSession
) {
    if (!idempotencyKey) return null;

    const existing = await WalletTransactionModel.findOne(
        { idempotency_key: idempotencyKey },
        null,
        session ? { session } : {}
    ).lean();

    return existing || null;
}

/**
 * Check if a transaction with the given idempotency key already exists,
 * and if so, throw a descriptive error.
 * Returns void if no duplicate is found.
 */
export async function enforceIdempotency(
    idempotencyKey: string,
    session?: ClientSession
): Promise<void> {
    const existing = await checkIdempotency(idempotencyKey, session);
    if (existing) {
        throw new Error("DUPLICATE_IDEMPOTENCY_KEY");
    }
}
