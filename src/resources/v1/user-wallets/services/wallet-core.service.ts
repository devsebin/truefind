import mongoose, { ClientSession, Types } from "mongoose";
import { WalletModel } from "@/database/user-wallet/user-wallet-db-model";
import { WalletAccountModel } from "@/database/user-wallet-accounts/user-wallet-accounts-db-model";
import { CurrencyCode, IWallet } from "@/database/user-wallet/user-wallet-db-interface";
import { AccountType, IWalletAccount } from "@/database/user-wallet-accounts/user-wallet-accounts-db-interface";
import { generateWalletNumber } from "../helpers/transaction-number.util";

class WalletCoreService {
    /**
     * Get or create a wallet for a user.
     * If no wallet exists, auto-provisions one with the given default currency.
     */
    async getOrCreateWallet(
        userId: Types.ObjectId,
        defaultCurrency: CurrencyCode = "INR",
        session?: ClientSession
    ): Promise<IWallet> {
        let wallet = await WalletModel.findOne(
            { user_id: userId, is_deleted: false },
            null,
            session ? { session } : {}
        );

        if (!wallet) {
            wallet = await WalletModel.create(
                [
                    {
                        user_id: userId,
                        wallet_number: generateWalletNumber(),
                        status: "active",
                        default_currency: defaultCurrency,
                    },
                ],
                session ? { session } : {}
            ).then((docs) => docs[0]);
        }

        return wallet!;
    }

    /**
     * Get a wallet by user ID. Throws if not found.
     */
    async getWalletByUserId(
        userId: Types.ObjectId,
        session?: ClientSession
    ): Promise<IWallet> {
        const wallet = await WalletModel.findOne(
            { user_id: userId, is_deleted: false },
            null,
            session ? { session } : {}
        );

        if (!wallet) {
            throw new Error("WALLET_NOT_FOUND");
        }

        return wallet;
    }

    /**
     * Get a wallet by its ID. Throws if not found.
     */
    async getWalletById(
        walletId: Types.ObjectId,
        session?: ClientSession
    ): Promise<IWallet> {
        const wallet = await WalletModel.findOne(
            { _id: walletId, is_deleted: false },
            null,
            session ? { session } : {}
        );

        if (!wallet) {
            throw new Error("WALLET_NOT_FOUND");
        }

        return wallet;
    }

    /**
     * Get or create a wallet account for a specific currency.
     */
    async getOrCreateAccount(
        walletId: Types.ObjectId,
        userId: Types.ObjectId,
        currency: CurrencyCode,
        accountType: AccountType = "customer_wallet",
        session?: ClientSession
    ): Promise<IWalletAccount> {
        let account = await WalletAccountModel.findOne(
            {
                wallet_id: walletId,
                currency,
                is_deleted: false,
            },
            null,
            session ? { session } : {}
        );

        if (!account) {
            account = await WalletAccountModel.create(
                [
                    {
                        wallet_id: walletId,
                        user_id: userId,
                        currency,
                        account_type: accountType,
                        status: "active",
                        available_balance_minor: "0",
                        pending_balance_minor: "0",
                        locked_balance_minor: "0",
                        version: 0,
                    },
                ],
                session ? { session } : {}
            ).then((docs) => docs[0]);
        }

        return account!;
    }

    /**
     * Get all wallet accounts for a user.
     */
    async getAccountsByUserId(
        userId: Types.ObjectId,
        session?: ClientSession
    ): Promise<IWalletAccount[]> {
        return WalletAccountModel.find(
            { user_id: userId, is_deleted: false },
            null,
            session ? { session } : {}
        );
    }

    /**
     * Get a specific wallet account by currency for a user.
     */
    async getAccountByCurrency(
        userId: Types.ObjectId,
        currency: CurrencyCode,
        session?: ClientSession
    ): Promise<IWalletAccount> {
        const account = await WalletAccountModel.findOne(
            {
                user_id: userId,
                currency,
                is_deleted: false,
            },
            null,
            session ? { session } : {}
        );

        if (!account) {
            throw new Error("WALLET_ACCOUNT_NOT_FOUND");
        }

        return account;
    }

    /**
     * Validate that a wallet is active and can transact.
     */
    validateWalletActive(wallet: any): void {
        if (wallet.status !== "active") {
            throw new Error(`WALLET_${wallet.status.toUpperCase()}`);
        }
    }

    /**
     * Validate that a wallet account is active.
     */
    validateAccountActive(account: any): void {
        if (account.status !== "active") {
            throw new Error(`ACCOUNT_${account.status.toUpperCase()}`);
        }
    }
}

export default new WalletCoreService();
