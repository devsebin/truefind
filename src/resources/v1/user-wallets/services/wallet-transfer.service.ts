import { Types } from "mongoose";
import { CurrencyCode } from "@/database/user-wallet/user-wallet-db-interface";
import { WalletTransferModel } from "@/database/user-wallet-transfers/user-wallet-transfers-db-model";
import { validateAmount } from "../helpers/money.util";
import { generateTransferNumber } from "../helpers/transaction-number.util";
import { withWalletTransaction } from "../helpers/with-wallet-transaction.util";
import { checkIdempotency } from "../helpers/idempotency.util";
import walletCoreService from "./wallet-core.service";
import walletLedgerService from "./wallet-ledger.service";

/**
 * Transfer service.
 * Atomic wallet-to-wallet transfer in one MongoDB transaction:
 * Debit sender → Credit receiver → Create transfer record + dual ledger entries.
 */
class WalletTransferService {
    /**
     * Execute a wallet-to-wallet transfer.
     */
    async execute(params: {
        from_user_id: Types.ObjectId;
        to_user_id: Types.ObjectId;
        amount_minor: number;
        currency: CurrencyCode;
        fee_minor?: number;
        description?: string;
        idempotency_key: string;
    }) {
        const {
            from_user_id, to_user_id, amount_minor, currency,
            fee_minor = 0, description, idempotency_key,
        } = params;

        validateAmount(amount_minor, currency);

        if (from_user_id.equals(to_user_id)) {
            throw new Error("CANNOT_TRANSFER_TO_SELF");
        }

        // Idempotency check
        const existing = await checkIdempotency(idempotency_key);
        if (existing) return existing;

        // Get sender wallet & account
        const senderWallet = await walletCoreService.getWalletByUserId(from_user_id);
        walletCoreService.validateWalletActive(senderWallet);
        const senderAccount = await walletCoreService.getAccountByCurrency(
            from_user_id, currency
        );
        walletCoreService.validateAccountActive(senderAccount);

        // Get receiver wallet & account (auto-create if needed)
        const receiverWallet = await walletCoreService.getOrCreateWallet(
            to_user_id, currency
        );
        walletCoreService.validateWalletActive(receiverWallet);
        const receiverAccount = await walletCoreService.getOrCreateAccount(
            receiverWallet._id as Types.ObjectId,
            to_user_id,
            currency,
            "customer_wallet"
        );

        const transferNumber = generateTransferNumber();

        // Create transfer record
        const [transfer] = await WalletTransferModel.create(
            [
                {
                    transfer_number: transferNumber,
                    from_account_id: senderAccount._id as Types.ObjectId,
                    to_account_id: receiverAccount._id as Types.ObjectId,
                    from_user_id,
                    to_user_id,
                    currency,
                    amount_minor: amount_minor.toString(),
                    fee_minor: fee_minor.toString(),
                    status: "completed",
                    idempotency_key,
                    description,
                    completed_at: new Date(),
                },
            ]
        );

        // Debit sender
        await walletLedgerService.debit({
            wallet_id: senderWallet._id as Types.ObjectId,
            account_id: senderAccount._id as Types.ObjectId,
            user_id: from_user_id,
            amount_minor,
            currency,
            type: "transfer",
            description: description || `Transfer to user`,
            idempotency_key: `${idempotency_key}-debit`,
            transfer_id: transfer._id as Types.ObjectId,
            fee_minor,
        });

        // Credit receiver
        await walletLedgerService.credit({
            wallet_id: receiverWallet._id as Types.ObjectId,
            account_id: receiverAccount._id as Types.ObjectId,
            user_id: to_user_id,
            amount_minor: amount_minor - fee_minor,
            currency,
            type: "transfer",
            description: description || `Transfer from user`,
            idempotency_key: `${idempotency_key}-credit`,
            transfer_id: transfer._id as Types.ObjectId,
        });

        return transfer;
    }

    /**
     * List transfers for a user (sent and received).
     */
    async listTransfers(userId: Types.ObjectId, page = 1, limit = 20) {
        const filter = {
            $or: [{ from_user_id: userId }, { to_user_id: userId }],
            is_deleted: false,
        };
        const skip = (page - 1) * limit;

        const [transfers, total] = await Promise.all([
            WalletTransferModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            WalletTransferModel.countDocuments(filter),
        ]);

        return {
            transfers,
            pagination: {
                page, limit, total,
                total_pages: Math.ceil(total / limit),
                has_next: page * limit < total,
                has_prev: page > 1,
            },
        };
    }

    /**
     * Get a single transfer by ID.
     */
    async getTransfer(transferId: Types.ObjectId, userId: Types.ObjectId) {
        const transfer = await WalletTransferModel.findOne({
            _id: transferId,
            $or: [{ from_user_id: userId }, { to_user_id: userId }],
            is_deleted: false,
        }).lean();

        if (!transfer) throw new Error("TRANSFER_NOT_FOUND");
        return transfer;
    }
}

export default new WalletTransferService();
