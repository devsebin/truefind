import { statusCodes } from "@/utils/definitions/constants/common";

export const walletErrorMessages: Record<string, { message: string; status: number }> = {
    WALLET_NOT_FOUND: {
        message: "Wallet not found.",
        status: statusCodes.NotFound,
    },
    WALLET_FROZEN: {
        message: "Wallet is frozen. Contact support.",
        status: statusCodes.Forbidden,
    },
    WALLET_SUSPENDED: {
        message: "Wallet is suspended. Contact support.",
        status: statusCodes.Forbidden,
    },
    WALLET_CLOSED: {
        message: "Wallet is closed.",
        status: statusCodes.Forbidden,
    },
    WALLET_ACCOUNT_NOT_FOUND: {
        message: "Wallet account not found for the specified currency.",
        status: statusCodes.NotFound,
    },
    ACCOUNT_FROZEN: {
        message: "Wallet account is frozen.",
        status: statusCodes.Forbidden,
    },
    ACCOUNT_CLOSED: {
        message: "Wallet account is closed.",
        status: statusCodes.Forbidden,
    },
    INSUFFICIENT_BALANCE: {
        message: "Insufficient balance for this transaction.",
        status: statusCodes.BadRequest,
    },
    CURRENCY_MISMATCH: {
        message: "Currency mismatch between account and transaction.",
        status: statusCodes.BadRequest,
    },
    DUPLICATE_IDEMPOTENCY_KEY: {
        message: "A transaction with this idempotency key already exists.",
        status: statusCodes.Conflict,
    },
    TRANSACTION_NOT_FOUND: {
        message: "Transaction not found.",
        status: statusCodes.NotFound,
    },
    HOLD_NOT_FOUND: {
        message: "Hold not found or not active.",
        status: statusCodes.NotFound,
    },
    HOLD_RELEASE_FAILED: {
        message: "Failed to release hold. The locked balance may have changed.",
        status: statusCodes.BadRequest,
    },
    HOLD_CAPTURE_FAILED: {
        message: "Failed to capture hold.",
        status: statusCodes.BadRequest,
    },
    CAPTURE_EXCEEDS_HOLD: {
        message: "Capture amount exceeds the held amount.",
        status: statusCodes.BadRequest,
    },
    TRANSFER_NOT_FOUND: {
        message: "Transfer not found.",
        status: statusCodes.NotFound,
    },
    CANNOT_TRANSFER_TO_SELF: {
        message: "Cannot transfer funds to your own wallet.",
        status: statusCodes.BadRequest,
    },
    PARENT_TRANSACTION_NOT_FOUND: {
        message: "Parent transaction not found or not in a valid state for this operation.",
        status: statusCodes.NotFound,
    },
    REFUND_EXCEEDS_ORIGINAL: {
        message: "Total refund amount exceeds the original transaction amount.",
        status: statusCodes.BadRequest,
    },
    REFUND_NOT_FOUND: {
        message: "Refund not found.",
        status: statusCodes.NotFound,
    },
    REVERSAL_EXCEEDS_ORIGINAL: {
        message: "Reversal amount exceeds the original transaction amount.",
        status: statusCodes.BadRequest,
    },
    REVERSAL_NOT_FOUND: {
        message: "Reversal not found.",
        status: statusCodes.NotFound,
    },
    DEPOSIT_NOT_FOUND: {
        message: "Deposit not found.",
        status: statusCodes.NotFound,
    },
    DEPOSIT_TRANSACTION_NOT_FOUND: {
        message: "Deposit transaction not found or already processed.",
        status: statusCodes.NotFound,
    },
    WITHDRAWAL_NOT_FOUND: {
        message: "Withdrawal not found.",
        status: statusCodes.NotFound,
    },
    WITHDRAWAL_TRANSACTION_NOT_FOUND: {
        message: "Withdrawal transaction not found or already processed.",
        status: statusCodes.NotFound,
    },
    WITHDRAWAL_NOT_FOUND_OR_NOT_CANCELLABLE: {
        message: "Withdrawal not found or cannot be cancelled in its current state.",
        status: statusCodes.BadRequest,
    },
    BALANCE_UPDATE_FAILED: {
        message: "Failed to update wallet balance. Please try again.",
        status: statusCodes.InternalServerError,
    },
    WEBHOOK_SIGNATURE_INVALID: {
        message: "Webhook signature verification failed.",
        status: statusCodes.BadRequest,
    },
    PAYOUT_INITIATION_FAILED: {
        message: "Failed to initiate payout with payment provider.",
        status: statusCodes.InternalServerError,
    },
};

export const walletSuccessMessages = {
    wallet_fetched: {
        message: "Wallet fetched successfully.",
        status: statusCodes.OK,
    },
    accounts_fetched: {
        message: "Wallet accounts fetched successfully.",
        status: statusCodes.OK,
    },
    account_fetched: {
        message: "Wallet account fetched successfully.",
        status: statusCodes.OK,
    },
    balance_fetched: {
        message: "Balance fetched successfully.",
        status: statusCodes.OK,
    },
    deposit_initiated: {
        message: "Deposit initiated successfully.",
        status: statusCodes.Created,
    },
    deposit_fetched: {
        message: "Deposit fetched successfully.",
        status: statusCodes.OK,
    },
    withdrawal_requested: {
        message: "Withdrawal requested successfully.",
        status: statusCodes.Created,
    },
    withdrawals_fetched: {
        message: "Withdrawals fetched successfully.",
        status: statusCodes.OK,
    },
    withdrawal_fetched: {
        message: "Withdrawal fetched successfully.",
        status: statusCodes.OK,
    },
    withdrawal_cancelled: {
        message: "Withdrawal cancelled successfully.",
        status: statusCodes.OK,
    },
    hold_created: {
        message: "Hold created successfully.",
        status: statusCodes.Created,
    },
    holds_fetched: {
        message: "Holds fetched successfully.",
        status: statusCodes.OK,
    },
    hold_fetched: {
        message: "Hold fetched successfully.",
        status: statusCodes.OK,
    },
    hold_released: {
        message: "Hold released successfully.",
        status: statusCodes.OK,
    },
    hold_captured: {
        message: "Hold captured successfully.",
        status: statusCodes.OK,
    },
    transfer_completed: {
        message: "Transfer completed successfully.",
        status: statusCodes.Created,
    },
    transfers_fetched: {
        message: "Transfers fetched successfully.",
        status: statusCodes.OK,
    },
    transfer_fetched: {
        message: "Transfer fetched successfully.",
        status: statusCodes.OK,
    },
    refund_created: {
        message: "Refund created successfully.",
        status: statusCodes.Created,
    },
    refunds_fetched: {
        message: "Refunds fetched successfully.",
        status: statusCodes.OK,
    },
    refund_fetched: {
        message: "Refund fetched successfully.",
        status: statusCodes.OK,
    },
    reversal_created: {
        message: "Reversal created successfully.",
        status: statusCodes.Created,
    },
    reversals_fetched: {
        message: "Reversals fetched successfully.",
        status: statusCodes.OK,
    },
    reversal_fetched: {
        message: "Reversal fetched successfully.",
        status: statusCodes.OK,
    },
    transactions_fetched: {
        message: "Transactions fetched successfully.",
        status: statusCodes.OK,
    },
    transaction_fetched: {
        message: "Transaction fetched successfully.",
        status: statusCodes.OK,
    },
    ledger_fetched: {
        message: "Ledger entries fetched successfully.",
        status: statusCodes.OK,
    },
};
