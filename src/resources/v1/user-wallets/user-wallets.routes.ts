import { Router } from "express";
import userWalletsController from "./user-wallets.controller";
import validationMiddleware, { validationSource } from "@/middlewares/request-validation.middleware";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";
import {
  getAccountByCurrencyValidator,
  getBalanceValidator,
  createDepositValidator,
  createWithdrawalValidator,
  listWithdrawalsValidator,
  createHoldValidator,
  listHoldsValidator,
  releaseHoldValidator,
  captureHoldValidator,
  createTransferValidator,
  listTransfersValidator,
  createRefundValidator,
  listRefundsValidator,
  createReversalValidator,
  listReversalsValidator,
  listTransactionsValidator,
  listLedgerValidator,
} from "./user-wallets.validator";

const UserWalletsRouter = Router();

// ─── Wallet & Accounts ──────────────────────────────────────────
UserWalletsRouter.get("/", userWalletsController.GetWallet);
UserWalletsRouter.get("/accounts", userWalletsController.GetAccounts);
UserWalletsRouter.get(
  "/accounts/:currency",
  validationMiddleware(getAccountByCurrencyValidator, validationSource.params),
  userWalletsController.GetAccountByCurrency
);
UserWalletsRouter.get(
  "/balance",
  validationMiddleware(getBalanceValidator, validationSource.query),
  userWalletsController.GetBalance
);
UserWalletsRouter.post(
  "/balance",
  validationMiddleware(getBalanceValidator, validationSource.body),
  userWalletsController.GetBalance
);

// ─── Deposits ───────────────────────────────────────────────────
UserWalletsRouter.post(
  "/deposits",
  validationMiddleware(createDepositValidator),
  userWalletsController.CreateDeposit
);
UserWalletsRouter.get(
  "/deposits/:id",
  paramsValidator,
  userWalletsController.GetDeposit
);

// ─── Withdrawals ────────────────────────────────────────────────
UserWalletsRouter.post(
  "/withdrawals",
  validationMiddleware(createWithdrawalValidator),
  userWalletsController.CreateWithdrawal
);
UserWalletsRouter.get(
  "/withdrawals",
  validationMiddleware(listWithdrawalsValidator, validationSource.query),
  userWalletsController.ListWithdrawals
);
UserWalletsRouter.get(
  "/withdrawals/:id",
  paramsValidator,
  userWalletsController.GetWithdrawal
);
UserWalletsRouter.post(
  "/withdrawals/:id/cancel",
  paramsValidator,
  userWalletsController.CancelWithdrawal
);

// ─── Holds ──────────────────────────────────────────────────────
UserWalletsRouter.post(
  "/holds",
  validationMiddleware(createHoldValidator),
  userWalletsController.CreateHold
);
UserWalletsRouter.get(
  "/holds",
  validationMiddleware(listHoldsValidator, validationSource.query),
  userWalletsController.ListHolds
);
UserWalletsRouter.get(
  "/holds/:id",
  paramsValidator,
  userWalletsController.GetHold
);
UserWalletsRouter.post(
  "/holds/:id/release",
  paramsValidator,
  validationMiddleware(releaseHoldValidator),
  userWalletsController.ReleaseHold
);
UserWalletsRouter.post(
  "/holds/:id/capture",
  paramsValidator,
  validationMiddleware(captureHoldValidator),
  userWalletsController.CaptureHold
);

// ─── Transfers ──────────────────────────────────────────────────
UserWalletsRouter.post(
  "/transfers",
  validationMiddleware(createTransferValidator),
  userWalletsController.CreateTransfer
);
UserWalletsRouter.get(
  "/transfers",
  validationMiddleware(listTransfersValidator, validationSource.query),
  userWalletsController.ListTransfers
);
UserWalletsRouter.get(
  "/transfers/:id",
  paramsValidator,
  userWalletsController.GetTransfer
);

// ─── Refunds ────────────────────────────────────────────────────
UserWalletsRouter.post(
  "/refunds",
  validationMiddleware(createRefundValidator),
  userWalletsController.CreateRefund
);
UserWalletsRouter.get(
  "/refunds",
  validationMiddleware(listRefundsValidator, validationSource.query),
  userWalletsController.ListRefunds
);
UserWalletsRouter.get(
  "/refunds/:id",
  paramsValidator,
  userWalletsController.GetRefund
);

// ─── Reversals ──────────────────────────────────────────────────
UserWalletsRouter.post(
  "/reversals",
  validationMiddleware(createReversalValidator),
  userWalletsController.CreateReversal
);
UserWalletsRouter.get(
  "/reversals",
  validationMiddleware(listReversalsValidator, validationSource.query),
  userWalletsController.ListReversals
);
UserWalletsRouter.get(
  "/reversals/:id",
  paramsValidator,
  userWalletsController.GetReversal
);

// ─── Transactions & Ledger ──────────────────────────────────────
UserWalletsRouter.get(
  "/transactions",
  validationMiddleware(listTransactionsValidator, validationSource.query),
  userWalletsController.ListTransactions
);
UserWalletsRouter.get(
  "/transactions/:id",
  paramsValidator,
  userWalletsController.GetTransaction
);
UserWalletsRouter.get(
  "/ledger",
  validationMiddleware(listLedgerValidator, validationSource.query),
  userWalletsController.GetLedger
);

export default UserWalletsRouter;