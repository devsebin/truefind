import { Types } from "mongoose";
import { WalletAccountModel } from "@/database/user-wallet-accounts/user-wallet-accounts-db-model";
import { WalletHoldModel } from "@/database/user-wallet-holds/user-wallet-holds-db-model";
import { CurrencyCode } from "@/database/user-wallet/user-wallet-db-interface";
import { HoldStatus } from "@/database/user-wallet-holds/user-wallet-holds-db-interface";
import { validateAmount, parseDecimal128ToNumber } from "../helpers/money.util";
import { withWalletTransaction } from "../helpers/with-wallet-transaction.util";

class WalletHoldService {
    /**
     * Create a hold on funds (moves available → locked).
     */
    async createHold(params: {
        wallet_account_id: Types.ObjectId;
        user_id: Types.ObjectId;
        amount_minor: number;
        currency: CurrencyCode;
        reference_type: string;
        reference_id: Types.ObjectId;
        expires_at?: Date;
        description?: string;
    }) {
        const {
            wallet_account_id, user_id, amount_minor, currency,
            reference_type, reference_id, expires_at,
        } = params;

        validateAmount(amount_minor, currency);

        return withWalletTransaction(async (session) => {
            // Atomic: decrease available, increase locked
            const updated = await WalletAccountModel.findOneAndUpdate(
                {
                    _id: wallet_account_id,
                    status: "active",
                    is_deleted: false,
                    currency,
                    available_balance_minor: { $gte: amount_minor as any },
                } as any,
                {
                    $inc: {
                        available_balance_minor: -amount_minor,
                        locked_balance_minor: amount_minor,
                        version: 1,
                    },
                } as any,
                { returnDocument: 'after', session }
            );

            if (!updated) {
                throw new Error("INSUFFICIENT_BALANCE");
            }

            // Create hold record
            const [hold] = await WalletHoldModel.create(
                [
                    {
                        wallet_account_id,
                        user_id,
                        amount_minor: amount_minor.toString(),
                        currency,
                        status: "active" as HoldStatus,
                        reference_type,
                        reference_id,
                        expires_at,
                    },
                ],
                { session }
            );

            return hold;
        });
    }

    /**
     * Release a hold (moves locked → available, returns funds).
     */
    async releaseHold(params: {
        hold_id: Types.ObjectId;
        user_id: Types.ObjectId;
        reason?: string;
    }) {
        const { hold_id, user_id } = params;

        return withWalletTransaction(async (session) => {
            const hold = await WalletHoldModel.findOne(
                { _id: hold_id, user_id, status: "active" },
                null,
                { session }
            );

            if (!hold) {
                throw new Error("HOLD_NOT_FOUND");
            }

            const holdAmount = parseDecimal128ToNumber(hold.amount_minor);

            // Move locked → available
            const updated = await WalletAccountModel.findOneAndUpdate(
                {
                    _id: hold.wallet_account_id,
                    locked_balance_minor: { $gte: holdAmount as any },
                } as any,
                {
                    $inc: {
                        locked_balance_minor: -holdAmount,
                        available_balance_minor: holdAmount,
                        version: 1,
                    },
                } as any,
                { returnDocument: 'after', session }
            );

            if (!updated) {
                throw new Error("HOLD_RELEASE_FAILED");
            }

            // Update hold status
            hold.status = "released";
            hold.released_at = new Date();
            await hold.save({ session });

            return hold;
        });
    }

    /**
     * Capture a hold (deducts locked funds, completing the payment).
     */
    async captureHold(params: {
        hold_id: Types.ObjectId;
        user_id: Types.ObjectId;
        capture_amount_minor?: number;
        description?: string;
    }) {
        const { hold_id, user_id, capture_amount_minor } = params;

        return withWalletTransaction(async (session) => {
            const hold = await WalletHoldModel.findOne(
                { _id: hold_id, user_id, status: "active" },
                null,
                { session }
            );

            if (!hold) {
                throw new Error("HOLD_NOT_FOUND");
            }

            const holdAmount = parseDecimal128ToNumber(hold.amount_minor);
            const captureAmount = capture_amount_minor ?? holdAmount;

            if (captureAmount > holdAmount) {
                throw new Error("CAPTURE_EXCEEDS_HOLD");
            }

            // Decrease locked by captured amount
            const remainingLock = holdAmount - captureAmount;

            const updated = await WalletAccountModel.findOneAndUpdate(
                {
                    _id: hold.wallet_account_id,
                    locked_balance_minor: { $gte: holdAmount as any },
                } as any,
                {
                    $inc: {
                        locked_balance_minor: -holdAmount,
                        version: 1,
                    },
                } as any,
                { returnDocument: 'after', session }
            );

            if (!updated) {
                throw new Error("HOLD_CAPTURE_FAILED");
            }

            // If partial, return remainder to available
            if (remainingLock > 0) {
                await WalletAccountModel.findOneAndUpdate(
                    { _id: hold.wallet_account_id },
                    { $inc: { available_balance_minor: remainingLock } } as any,
                    { session }
                );
            }

            // Update hold status
            hold.status = "captured";
            hold.captured_at = new Date();
            await hold.save({ session });

            return hold;
        });
    }

    /**
     * List active holds for a user.
     */
    async listHolds(userId: Types.ObjectId, status?: HoldStatus) {
        const filter: any = { user_id: userId };
        if (status) filter.status = status;

        return WalletHoldModel.find(filter).sort({ createdAt: -1 }).lean();
    }

    /**
     * Get a single hold by ID.
     */
    async getHoldById(holdId: Types.ObjectId, userId: Types.ObjectId) {
        const hold = await WalletHoldModel.findOne({
            _id: holdId,
            user_id: userId,
        }).lean();

        if (!hold) {
            throw new Error("HOLD_NOT_FOUND");
        }

        return hold;
    }
}

export default new WalletHoldService();
