import mongoose, { ClientSession } from "mongoose";

/**
 * Execute a callback inside a MongoDB transaction with production-safe settings.
 *
 * Uses:
 * - readConcern: snapshot (consistent reads within the transaction)
 * - writeConcern: majority (durable writes)
 * - readPreference: primary (always read from primary)
 *
 * If the callback throws, the transaction is automatically aborted.
 * On success, the transaction is committed.
 *
 * @example
 * const result = await withWalletTransaction(async (session) => {
 *   // all DB operations here use { session }
 *   return someResult;
 * });
 */
export async function withWalletTransaction<T>(
    callback: (session: ClientSession) => Promise<T>
): Promise<T> {
    const session = await mongoose.startSession();

    try {
        let result!: T;

        await session.withTransaction(
            async () => {
                result = await callback(session);
            },
            {
                readConcern: { level: "snapshot" },
                writeConcern: { w: "majority" },
                readPreference: "primary",
            }
        );

        return result;
    } finally {
        await session.endSession();
    }
}
