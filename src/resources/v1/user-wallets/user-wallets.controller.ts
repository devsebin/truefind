import { Request, Response } from "express";
import mongoose from "mongoose";
import { errorMessages, statusCodes } from "@/utils/definitions/constants/common";
import { buildErrorResult, errorResponse } from "@/utils/responses/error.response";
import { JsonResponse } from "@/utils/responses/types";
import createActivityLogService from "../activity-log/services/create-activity-log.service";
import walletCoreService from "./services/wallet-core.service";
import walletBalanceService from "./services/wallet-balance.service";
import walletDepositService from "./services/wallet-deposit.service";
import walletWithdrawalService from "./services/wallet-withdrawal.service";
import walletHoldService from "./services/wallet-hold.service";
import walletTransferService from "./services/wallet-transfer.service";
import walletRefundService from "./services/wallet-refund.service";
import walletReversalService from "./services/wallet-reversal.service";
import { walletErrorMessages } from "./user-wallets.messages";
import { walletPayload } from "./user-wallets.helper";
import {
  walletResponse,
  accountResponse,
  accountListResponse,
  transactionResponse,
  transactionListResponse,
  holdResponse,
  holdListResponse,
  transferResponse,
  transferListResponse,
  ledgerListResponse,
} from "./user-wallets.response";
import { CurrencyCode } from "@/database/user-wallet/user-wallet-db-interface";
import { HoldStatus } from "@/database/user-wallet-holds/user-wallet-holds-db-interface";

class UserWalletsController {
  // ─── WALLET & ACCOUNTS ──────────────────────────────────────────

  async GetWallet(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const wallet = await walletCoreService.getOrCreateWallet(userId);
      response = walletPayload("wallet_fetched", walletResponse(wallet));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async GetAccounts(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const accounts = await walletCoreService.getAccountsByUserId(userId);
      response = walletPayload("accounts_fetched", accountListResponse(accounts));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async GetAccountByCurrency(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const currency = req.params.currency as CurrencyCode;
      const account = await walletCoreService.getAccountByCurrency(userId, currency);
      response = walletPayload("account_fetched", accountResponse(account));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async GetBalance(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const currency = (req.query.currency as CurrencyCode) || (req.body?.currency as CurrencyCode);
      const balanceData = await walletBalanceService.getBalance(userId, currency);
      response = walletPayload("balance_fetched", balanceData);
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  // ─── DEPOSITS ───────────────────────────────────────────────────

  async CreateDeposit(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const { amount_minor, currency, provider, idempotency_key, description, metadata } = req.body;
      const result = await walletDepositService.initiate({
        user_id: userId,
        amount_minor,
        currency,
        provider,
        idempotency_key,
        description,
        metadata,
      });
      response = walletPayload("deposit_initiated", {
        transaction: transactionResponse(result.transaction),
        provider_data: result.provider_data,
      });
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async GetDeposit(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const depositId = new mongoose.Types.ObjectId(String(req.params.id));
      const deposit = await walletDepositService.getDeposit(depositId, userId);
      response = walletPayload("deposit_fetched", transactionResponse(deposit));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  // ─── WITHDRAWALS ────────────────────────────────────────────────

  async CreateWithdrawal(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const { amount_minor, currency, provider, payout_destination, idempotency_key, description } = req.body;
      const result = await walletWithdrawalService.request({
        user_id: userId,
        amount_minor,
        currency,
        provider,
        payout_destination,
        idempotency_key,
        description,
      });
      response = walletPayload("withdrawal_requested", {
        transaction: transactionResponse(result.transaction),
        hold: holdResponse(result.hold),
        provider_data: result.provider_data,
      });
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async ListWithdrawals(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const { transactions, pagination } = await walletWithdrawalService.listWithdrawals(userId, page, limit);
      response = walletPayload("withdrawals_fetched", {
        withdrawals: transactionListResponse(transactions),
        pagination,
      });
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async GetWithdrawal(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const withdrawalId = new mongoose.Types.ObjectId(String(req.params.id));
      const withdrawal = await walletWithdrawalService.getWithdrawal(withdrawalId, userId);
      response = walletPayload("withdrawal_fetched", transactionResponse(withdrawal));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async CancelWithdrawal(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const withdrawalId = new mongoose.Types.ObjectId(String(req.params.id));
      const withdrawal = await walletWithdrawalService.cancel(withdrawalId, userId);
      response = walletPayload("withdrawal_cancelled", transactionResponse(withdrawal));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  // ─── HOLDS ──────────────────────────────────────────────────────

  async CreateHold(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const { wallet_account_id, amount_minor, currency, reference_type, reference_id, expires_at, description } = req.body;
      const hold = await walletHoldService.createHold({
        wallet_account_id: new mongoose.Types.ObjectId(wallet_account_id),
        user_id: userId,
        amount_minor,
        currency,
        reference_type,
        reference_id: new mongoose.Types.ObjectId(reference_id),
        expires_at: expires_at ? new Date(expires_at) : undefined,
        description,
      });
      response = walletPayload("hold_created", holdResponse(hold));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async ListHolds(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const status = req.query.status as HoldStatus | undefined;
      const holds = await walletHoldService.listHolds(userId, status);
      response = walletPayload("holds_fetched", holdListResponse(holds));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async GetHold(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const holdId = new mongoose.Types.ObjectId(String(req.params.id));
      const hold = await walletHoldService.getHoldById(holdId, userId);
      response = walletPayload("hold_fetched", holdResponse(hold));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async ReleaseHold(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const holdId = new mongoose.Types.ObjectId(String(req.params.id));
      const { reason } = req.body;
      const hold = await walletHoldService.releaseHold({
        hold_id: holdId,
        user_id: userId,
        reason,
      });
      response = walletPayload("hold_released", holdResponse(hold));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async CaptureHold(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const holdId = new mongoose.Types.ObjectId(String(req.params.id));
      const { capture_amount_minor, description } = req.body;
      const hold = await walletHoldService.captureHold({
        hold_id: holdId,
        user_id: userId,
        capture_amount_minor,
        description,
      });
      response = walletPayload("hold_captured", holdResponse(hold));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  // ─── TRANSFERS ──────────────────────────────────────────────────

  async CreateTransfer(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const fromUserId = new mongoose.Types.ObjectId(String(req.user._id));
      const { to_user_id, amount_minor, currency, fee_minor, description, idempotency_key } = req.body;
      const transfer = await walletTransferService.execute({
        from_user_id: fromUserId,
        to_user_id: new mongoose.Types.ObjectId(to_user_id),
        amount_minor,
        currency,
        fee_minor,
        description,
        idempotency_key,
      });
      response = walletPayload("transfer_completed", transferResponse(transfer));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async ListTransfers(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const { transfers, pagination } = await walletTransferService.listTransfers(userId, page, limit);
      response = walletPayload("transfers_fetched", {
        transfers: transferListResponse(transfers),
        pagination,
      });
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async GetTransfer(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const transferId = new mongoose.Types.ObjectId(String(req.params.id));
      const transfer = await walletTransferService.getTransfer(transferId, userId);
      response = walletPayload("transfer_fetched", transferResponse(transfer));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  // ─── REFUNDS ────────────────────────────────────────────────────

  async CreateRefund(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const { parent_transaction_id, amount_minor, currency, reason, idempotency_key } = req.body;
      const refund = await walletRefundService.create({
        parent_transaction_id: new mongoose.Types.ObjectId(parent_transaction_id),
        user_id: userId,
        amount_minor,
        currency,
        reason,
        idempotency_key,
      });
      response = walletPayload("refund_created", transactionResponse(refund));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async ListRefunds(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const { transactions, pagination } = await walletRefundService.listRefunds(userId, page, limit);
      response = walletPayload("refunds_fetched", {
        refunds: transactionListResponse(transactions),
        pagination,
      });
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async GetRefund(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const refundId = new mongoose.Types.ObjectId(String(req.params.id));
      const refund = await walletRefundService.getRefund(refundId, userId);
      response = walletPayload("refund_fetched", transactionResponse(refund));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  // ─── REVERSALS ──────────────────────────────────────────────────

  async CreateReversal(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const { parent_transaction_id, amount_minor, currency, reason, external_reference, idempotency_key } = req.body;
      const reversal = await walletReversalService.create({
        parent_transaction_id: new mongoose.Types.ObjectId(parent_transaction_id),
        user_id: userId,
        amount_minor,
        currency,
        reason,
        external_reference,
        idempotency_key,
      });
      response = walletPayload("reversal_created", transactionResponse(reversal));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async ListReversals(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const { transactions, pagination } = await walletReversalService.listReversals(userId, page, limit);
      response = walletPayload("reversals_fetched", {
        reversals: transactionListResponse(transactions),
        pagination,
      });
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async GetReversal(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const reversalId = new mongoose.Types.ObjectId(String(req.params.id));
      const reversal = await walletReversalService.getReversal(reversalId, userId);
      response = walletPayload("reversal_fetched", transactionResponse(reversal));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  // ─── TRANSACTIONS & LEDGER ──────────────────────────────────────

  async ListTransactions(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const { wallet_id, type, status, currency, page, limit, sort_by, sort_order } = req.query as any;
      const { transactions, pagination } = await walletBalanceService.listTransactions({
        user_id: userId,
        wallet_id: wallet_id ? new mongoose.Types.ObjectId(wallet_id) : undefined,
        type,
        status,
        currency,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        sort_by,
        sort_order,
      });
      response = walletPayload("transactions_fetched", {
        transactions: transactionListResponse(transactions),
        pagination,
      });
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async GetTransaction(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const transactionId = new mongoose.Types.ObjectId(String(req.params.id));
      const transaction = await walletBalanceService.getTransactionById(transactionId, userId);
      response = walletPayload("transaction_fetched", transactionResponse(transaction));
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }

  async GetLedger(req: Request, res: Response): Promise<JsonResponse | void> {
    let response: any;
    const start = Date.now();
    try {
      const userId = new mongoose.Types.ObjectId(String(req.user._id));
      const { account_id, page, limit } = req.query as any;
      const { entries, pagination } = await walletBalanceService.listLedgerEntries({
        user_id: userId,
        account_id: account_id ? new mongoose.Types.ObjectId(account_id) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      response = walletPayload("ledger_fetched", {
        ledger_entries: ledgerListResponse(entries),
        pagination,
      });
      return res.status(response.result.code).json(response.result);
    } catch (error: any) {
      response = buildErrorResult(error.message, walletErrorMessages);
      return res.status(response.result.code).json(response.result);
    } finally {
      createActivityLogService.execute(req, res, start, Date.now(), response);
    }
  }
}

export default new UserWalletsController();
