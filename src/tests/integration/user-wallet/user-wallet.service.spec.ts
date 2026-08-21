import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import mongoose from "mongoose";
import { WalletModel } from "@/database/user-wallet/user-wallet-db-model";
import { WalletAccountModel } from "@/database/user-wallet-accounts/user-wallet-accounts-db-model";
import { WalletTransactionModel } from "@/database/user-wallet-transactions/user-wallet-transactions-db-model";
import { WalletLedgerEntryModel } from "@/database/user-wallet-ledgers/user-wallet-ledgers-db-model";
import { WalletHoldModel } from "@/database/user-wallet-holds/user-wallet-holds-db-model";
import { WalletTransferModel } from "@/database/user-wallet-transfers/user-wallet-transfers-db-model";
import UserModel from "@/database/users/users-db-model";
import walletCoreService from "@/resources/v1/user-wallets/services/wallet-core.service";
import walletLedgerService from "@/resources/v1/user-wallets/services/wallet-ledger.service";
import walletBalanceService from "@/resources/v1/user-wallets/services/wallet-balance.service";
import walletHoldService from "@/resources/v1/user-wallets/services/wallet-hold.service";
import walletTransferService from "@/resources/v1/user-wallets/services/wallet-transfer.service";
import walletRefundService from "@/resources/v1/user-wallets/services/wallet-refund.service";
import walletReversalService from "@/resources/v1/user-wallets/services/wallet-reversal.service";
import { parseDecimal128ToNumber } from "@/resources/v1/user-wallets/helpers/money.util";

describe("User Wallet Module (Integration)", () => {
  let userAId: mongoose.Types.ObjectId;
  let userBId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await WalletModel.ensureIndexes();
    await WalletAccountModel.ensureIndexes();
    await WalletTransactionModel.ensureIndexes();
    await WalletLedgerEntryModel.ensureIndexes();
    await WalletHoldModel.ensureIndexes();
    await WalletTransferModel.ensureIndexes();
  });

  beforeEach(async () => {
    await WalletModel.deleteMany({});
    await WalletAccountModel.deleteMany({});
    await WalletTransactionModel.deleteMany({});
    await WalletLedgerEntryModel.deleteMany({});
    await WalletHoldModel.deleteMany({});
    await WalletTransferModel.deleteMany({});
    await UserModel.deleteMany({});

    userAId = new mongoose.Types.ObjectId();
    userBId = new mongoose.Types.ObjectId();
  });

  describe("Wallet Core & Provisioning", () => {
    it("should auto-provision a wallet and account for a new user", async () => {
      const wallet = await walletCoreService.getOrCreateWallet(userAId, "INR");
      expect(wallet).toBeDefined();
      expect(wallet.user_id.toString()).toBe(userAId.toString());
      expect(wallet.default_currency).toBe("INR");
      expect(wallet.status).toBe("active");

      const account = await walletCoreService.getOrCreateAccount(
        wallet._id,
        userAId,
        "INR"
      );
      expect(account).toBeDefined();
      expect(account.currency).toBe("INR");
      expect(parseDecimal128ToNumber(account.available_balance_minor)).toBe(0);
    });

    it("should return the existing wallet without duplicating", async () => {
      const wallet1 = await walletCoreService.getOrCreateWallet(userAId, "INR");
      const wallet2 = await walletCoreService.getOrCreateWallet(userAId, "INR");
      expect(wallet1._id.toString()).toBe(wallet2._id.toString());
    });
  });

  describe("Double-Entry Ledger & Credit/Debit Mutations", () => {
    it("should atomically credit user wallet and write an immutable ledger entry", async () => {
      const wallet = await walletCoreService.getOrCreateWallet(userAId, "INR");
      const account = await walletCoreService.getOrCreateAccount(wallet._id, userAId, "INR");

      const creditTxn = await walletLedgerService.credit({
        wallet_id: wallet._id,
        account_id: account._id,
        user_id: userAId,
        amount_minor: 50000, // ₹500.00
        currency: "INR",
        type: "deposit",
        description: "Initial deposit",
        idempotency_key: "test-dep-001",
      });

      expect(creditTxn).toBeDefined();
      expect(creditTxn.status).toBe("completed");

      // Verify updated account balance
      const updatedAccount = await WalletAccountModel.findById(account._id);
      expect(parseDecimal128ToNumber(updatedAccount!.available_balance_minor)).toBe(50000);

      // Verify ledger record
      const ledgerEntry = await WalletLedgerEntryModel.findOne({ transaction_id: creditTxn._id });
      expect(ledgerEntry).toBeDefined();
      expect(ledgerEntry!.direction).toBe("credit");
      expect(parseDecimal128ToNumber(ledgerEntry!.amount_minor)).toBe(50000);
      expect(parseDecimal128ToNumber(ledgerEntry!.balance_before_minor)).toBe(0);
      expect(parseDecimal128ToNumber(ledgerEntry!.balance_after_minor)).toBe(50000);
    });

    it("should reject debit if balance is insufficient", async () => {
      const wallet = await walletCoreService.getOrCreateWallet(userAId, "INR");
      const account = await walletCoreService.getOrCreateAccount(wallet._id, userAId, "INR");

      await expect(
        walletLedgerService.debit({
          wallet_id: wallet._id,
          account_id: account._id,
          user_id: userAId,
          amount_minor: 10000,
          currency: "INR",
          type: "withdrawal",
          description: "Overdraft attempt",
          idempotency_key: "test-wth-insufficient",
        })
      ).rejects.toThrow("INSUFFICIENT_BALANCE");
    });
  });

  describe("Holds Lifecycle (Lock, Release, Capture)", () => {
    it("should lock funds on hold, and restore on release", async () => {
      const wallet = await walletCoreService.getOrCreateWallet(userAId, "INR");
      const account = await walletCoreService.getOrCreateAccount(wallet._id, userAId, "INR");

      // Credit ₹500
      await walletLedgerService.credit({
        wallet_id: wallet._id,
        account_id: account._id,
        user_id: userAId,
        amount_minor: 50000,
        currency: "INR",
        type: "deposit",
        idempotency_key: "test-hold-dep",
      });

      // Create Hold ₹200
      const hold = await walletHoldService.createHold({
        wallet_account_id: account._id,
        user_id: userAId,
        amount_minor: 20000,
        currency: "INR",
        reference_type: "order",
        reference_id: new mongoose.Types.ObjectId(),
      });

      expect(hold.status).toBe("active");

      let acc = await WalletAccountModel.findById(account._id);
      expect(parseDecimal128ToNumber(acc!.available_balance_minor)).toBe(30000);
      expect(parseDecimal128ToNumber(acc!.locked_balance_minor)).toBe(20000);

      // Release Hold
      await walletHoldService.releaseHold({
        hold_id: hold._id as mongoose.Types.ObjectId,
        user_id: userAId,
      });

      acc = await WalletAccountModel.findById(account._id);
      expect(parseDecimal128ToNumber(acc!.available_balance_minor)).toBe(50000);
      expect(parseDecimal128ToNumber(acc!.locked_balance_minor)).toBe(0);
    });

    it("should permanently deduct locked balance on capture", async () => {
      const wallet = await walletCoreService.getOrCreateWallet(userAId, "INR");
      const account = await walletCoreService.getOrCreateAccount(wallet._id, userAId, "INR");

      await walletLedgerService.credit({
        wallet_id: wallet._id,
        account_id: account._id,
        user_id: userAId,
        amount_minor: 50000,
        currency: "INR",
        type: "deposit",
        idempotency_key: "test-cap-dep",
      });

      const hold = await walletHoldService.createHold({
        wallet_account_id: account._id,
        user_id: userAId,
        amount_minor: 20000,
        currency: "INR",
        reference_type: "order",
        reference_id: new mongoose.Types.ObjectId(),
      });

      await walletHoldService.captureHold({
        hold_id: hold._id as mongoose.Types.ObjectId,
        user_id: userAId,
      });

      const acc = await WalletAccountModel.findById(account._id);
      expect(parseDecimal128ToNumber(acc!.available_balance_minor)).toBe(30000);
      expect(parseDecimal128ToNumber(acc!.locked_balance_minor)).toBe(0);
    });
  });

  describe("Peer-to-Peer Transfers", () => {
    it("should execute atomic transfer from User A to User B", async () => {
      const walletA = await walletCoreService.getOrCreateWallet(userAId, "INR");
      const accountA = await walletCoreService.getOrCreateAccount(walletA._id, userAId, "INR");

      // Fund User A with ₹1000
      await walletLedgerService.credit({
        wallet_id: walletA._id,
        account_id: accountA._id,
        user_id: userAId,
        amount_minor: 100000,
        currency: "INR",
        type: "deposit",
        idempotency_key: "fund-a",
      });

      // Transfer ₹300 to User B
      const transfer = await walletTransferService.execute({
        from_user_id: userAId,
        to_user_id: userBId,
        amount_minor: 30000,
        currency: "INR",
        idempotency_key: "trf-a-to-b-001",
      });

      expect(transfer).toBeDefined();

      const accA = await walletCoreService.getAccountByCurrency(userAId, "INR");
      const accB = await walletCoreService.getAccountByCurrency(userBId, "INR");

      expect(parseDecimal128ToNumber(accA.available_balance_minor)).toBe(70000);
      expect(parseDecimal128ToNumber(accB.available_balance_minor)).toBe(30000);
    });

    it("should forbid transferring funds to oneself", async () => {
      await expect(
        walletTransferService.execute({
          from_user_id: userAId,
          to_user_id: userAId,
          amount_minor: 10000,
          currency: "INR",
          idempotency_key: "self-transfer",
        })
      ).rejects.toThrow("CANNOT_TRANSFER_TO_SELF");
    });
  });

  describe("Refunds & Reversals", () => {
    it("should create partial refund linked to parent without modifying original", async () => {
      const wallet = await walletCoreService.getOrCreateWallet(userAId, "INR");
      const account = await walletCoreService.getOrCreateAccount(wallet._id, userAId, "INR");

      const initialDebit = await walletLedgerService.credit({
        wallet_id: wallet._id,
        account_id: account._id,
        user_id: userAId,
        amount_minor: 10000,
        currency: "INR",
        type: "deposit",
        idempotency_key: "orig-txn-01",
      });

      const refundTxn = await walletRefundService.create({
        parent_transaction_id: initialDebit._id as mongoose.Types.ObjectId,
        user_id: userAId,
        amount_minor: 4000,
        currency: "INR",
        reason: "Defective item",
        idempotency_key: "ref-partial-01",
      });

      expect(refundTxn.parent_transaction_id!.toString()).toBe(initialDebit._id!.toString());
      expect(refundTxn.type).toBe("refund");

      // Verify refund exceeds check
      await expect(
        walletRefundService.create({
          parent_transaction_id: initialDebit._id as mongoose.Types.ObjectId,
          user_id: userAId,
          amount_minor: 7000, // 4000 + 7000 > 10000
          currency: "INR",
          idempotency_key: "ref-exceed-01",
        })
      ).rejects.toThrow("REFUND_EXCEEDS_ORIGINAL");
    });
  });

  describe("Balance & Queries", () => {
    it("should return formatted balances correctly", async () => {
      const wallet = await walletCoreService.getOrCreateWallet(userAId, "INR");
      const account = await walletCoreService.getOrCreateAccount(wallet._id, userAId, "INR");

      await walletLedgerService.credit({
        wallet_id: wallet._id,
        account_id: account._id,
        user_id: userAId,
        amount_minor: 12550, // ₹125.50
        currency: "INR",
        type: "deposit",
        idempotency_key: "bal-test-01",
      });

      const balances = await walletBalanceService.getBalance(userAId, "INR");
      expect(balances.length).toBe(1);
      expect(balances[0].available_balance_minor).toBe(12550);
      expect(balances[0].available_formatted).toBe("₹125.50");
    });
  });
});
