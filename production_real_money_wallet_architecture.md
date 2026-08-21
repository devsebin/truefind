# Production-Ready Real-Money Wallet Architecture

## Purpose

Implement a production-ready real-money wallet module for the existing Node.js + TypeScript + Express + MongoDB + Mongoose + Joi application.

The wallet is for a service marketplace and must support:

- Customer wallets
- Provider wallets
- Platform accounting
- Multiple currencies
- Deposits
- Withdrawals
- Transfers
- Purchases
- Refunds
- Reversals
- Platform fees/commissions
- Pending provider earnings
- Holds/locks
- Payment-provider webhooks
- Idempotency
- Immutable ledger
- Double-entry accounting
- Reconciliation
- Admin adjustments
- Auditability
- Concurrency protection
- MongoDB transactions

> IMPORTANT: This is a software/accounting architecture. Real-money operation also requires appropriate payment-provider integration, KYC/AML, safeguarding/escrow, tax, licensing, regulatory and compliance review for the countries in which the wallet operates.

---

# 1. Core Architecture

Use a double-entry ledger with wallet balances as a cached/current projection.

```text
USER
 │
 └── WALLET
      │
      └── WALLET ACCOUNT
            │
            ├── AVAILABLE BALANCE
            ├── PENDING BALANCE
            └── LOCKED BALANCE
                  │
                  ├── TRANSACTIONS
                  │
                  ├── HOLDS
                  │
                  └── LEDGER ENTRIES

Payment Provider
      │
      ▼
Webhook Events
      │
      ▼
Wallet Transactions
      │
      ▼
Ledger
      │
      ▼
Wallet Balance Projection

Reconciliation
      │
      ├── Payment Provider
      ├── Ledger
      └── Wallet Balances
```

## Fundamental accounting rules

1. The immutable ledger is the financial source of truth.
2. Wallet balances are a cached/current projection for fast reads.
3. Every financial movement creates a transaction.
4. Every completed financial transaction creates ledger entries.
5. Total debit must equal total credit for every double-entry transaction.
6. Ledger entries must never be edited or deleted.
7. Refunds and reversals create new transactions rather than modifying old transactions.
8. Balance changes and ledger creation must happen atomically inside MongoDB transactions.
9. No application code outside the wallet module may directly mutate wallet balances.
10. All external payment/webhook operations must be idempotent.

---

# 2. Collections

Create these MongoDB collections:

```text
wallets
wallet_accounts
wallet_transactions
wallet_ledger_entries
wallet_holds
wallet_transfers
payment_webhook_events
wallet_reconciliations
wallet_adjustments
```

---

# 3. Money Representation

Do NOT use JavaScript floating-point `number` for money.

Prefer integer minor units.

Examples:

```text
INR ₹100.50 = 10050 paise
NZD $25.50 = 2550 cents
USD $10.25 = 1025 cents
```

Use MongoDB `Long` / 64-bit integer for `amount_minor`.

Currency type:

```ts
export type CurrencyCode =
  | 'INR'
  | 'NZD'
  | 'USD'
  | 'AUD'
  | 'GBP';
```

Create a centralized money utility for:

- currency exponent
- minor-unit conversion
- formatting
- validation
- positive/zero checks
- maximum amount checks

Do not perform financial arithmetic using JavaScript floating-point values.

---

# 4. Common Types

```ts
import {
  Document,
  Types,
  ClientSession,
  Schema,
} from 'mongoose';

export type CurrencyCode =
  | 'INR'
  | 'NZD'
  | 'USD'
  | 'AUD'
  | 'GBP';

export type WalletStatus =
  | 'active'
  | 'frozen'
  | 'suspended'
  | 'closed';

export type WalletAccountStatus =
  | 'active'
  | 'frozen'
  | 'closed';

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'reversed';

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'purchase'
  | 'refund'
  | 'transfer'
  | 'fee'
  | 'cashback'
  | 'reversal'
  | 'adjustment'
  | 'payout'
  | 'commission';

export type LedgerDirection =
  | 'debit'
  | 'credit';

export type HoldStatus =
  | 'active'
  | 'released'
  | 'captured'
  | 'expired'
  | 'cancelled';

export type AccountType =
  | 'customer_wallet'
  | 'provider_wallet'
  | 'platform_cash'
  | 'platform_revenue'
  | 'platform_fee'
  | 'payment_clearing'
  | 'refund_liability'
  | 'withdrawal_clearing';
```

---

# 5. Wallet Model

A wallet is the user's wallet container.

Do not store the actual currency balance directly on the user document.

```ts
export interface IWallet extends Document {
  _id: Types.ObjectId;

  user_id: Types.ObjectId;

  wallet_number: string;

  status: WalletStatus;

  default_currency?: CurrencyCode;

  created_at: Date;
  updated_at: Date;
}
```

Schema:

```ts
const WalletSchema = new Schema<IWallet>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    wallet_number: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        'active',
        'frozen',
        'suspended',
        'closed',
      ],
      default: 'active',
      required: true,
      index: true,
    },

    default_currency: {
      type: String,
      enum: ['INR', 'NZD', 'USD', 'AUD', 'GBP'],
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

WalletSchema.index({
  user_id: 1,
});

WalletSchema.index({
  status: 1,
});
```

Recommended additional uniqueness:

```ts
WalletSchema.index(
  { user_id: 1 },
  { unique: true }
);
```

Use this only if the business rule is exactly one wallet per user.

---

# 6. Wallet Account Model

A wallet account holds the currency-specific balance.

Example:

```text
Wallet
 ├── INR account
 ├── NZD account
 └── USD account
```

Interface:

```ts
export interface IWalletAccount extends Document {
  _id: Types.ObjectId;

  wallet_id: Types.ObjectId;

  user_id: Types.ObjectId;

  currency: CurrencyCode;

  account_type: AccountType;

  status: WalletAccountStatus;

  available_balance_minor: Types.Long;

  pending_balance_minor: Types.Long;

  locked_balance_minor: Types.Long;

  version: number;

  created_at: Date;
  updated_at: Date;
}
```

Schema:

```ts
const WalletAccountSchema =
  new Schema<IWalletAccount>(
    {
      wallet_id: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true,
        index: true,
      },

      user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },

      currency: {
        type: String,
        enum: ['INR', 'NZD', 'USD', 'AUD', 'GBP'],
        required: true,
      },

      account_type: {
        type: String,
        enum: [
          'customer_wallet',
          'provider_wallet',
        ],
        required: true,
      },

      status: {
        type: String,
        enum: [
          'active',
          'frozen',
          'closed',
        ],
        default: 'active',
        required: true,
      },

      available_balance_minor: {
        type: Schema.Types.Long,
        required: true,
        default: 0,
      },

      pending_balance_minor: {
        type: Schema.Types.Long,
        required: true,
        default: 0,
      },

      locked_balance_minor: {
        type: Schema.Types.Long,
        required: true,
        default: 0,
      },

      version: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    {
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    }
  );
```

Indexes:

```ts
WalletAccountSchema.index(
  {
    wallet_id: 1,
    currency: 1,
  },
  {
    unique: true,
  }
);

WalletAccountSchema.index({
  user_id: 1,
  currency: 1,
});

WalletAccountSchema.index({
  status: 1,
});
```

---

# 7. Balance Semantics

Use these fields:

```text
available_balance_minor
pending_balance_minor
locked_balance_minor
```

Example:

```text
Available = ₹10,000
Pending   = ₹0
Locked    = ₹0
```

Withdrawal request for ₹3,000:

```text
Available = ₹7,000
Pending   = ₹0
Locked    = ₹3,000
```

Successful withdrawal:

```text
Available = ₹7,000
Pending   = ₹0
Locked    = ₹0
```

Failed withdrawal:

```text
Available = ₹10,000
Pending   = ₹0
Locked    = ₹0
```

Pending provider earnings:

```text
Available = ₹5,000
Pending   = ₹1,000
Locked    = ₹0
```

After service completion:

```text
Available = ₹6,000
Pending   = ₹0
Locked    = ₹0
```

---

# 8. Wallet Transaction Model

A transaction represents a business-level financial event.

```ts
export interface IWalletTransaction
  extends Document {

  _id: Types.ObjectId;

  transaction_number: string;

  wallet_id?: Types.ObjectId;

  user_id?: Types.ObjectId;

  type: TransactionType;

  status: TransactionStatus;

  currency: CurrencyCode;

  amount_minor: Types.Long;

  fee_minor: Types.Long;

  net_amount_minor: Types.Long;

  idempotency_key?: string;

  external_reference?: string;

  reference_type?: string;

  reference_id?: Types.ObjectId;

  parent_transaction_id?: Types.ObjectId;

  transfer_id?: Types.ObjectId;

  description?: string;

  metadata?: Record<string, unknown>;

  failure_code?: string;

  failure_reason?: string;

  created_by?: Types.ObjectId;

  processed_at?: Date;

  completed_at?: Date;

  created_at: Date;

  updated_at: Date;
}
```

Schema:

```ts
const WalletTransactionSchema =
  new Schema<IWalletTransaction>(
    {
      transaction_number: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
      },

      wallet_id: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet',
        index: true,
      },

      user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
      },

      type: {
        type: String,
        enum: [
          'deposit',
          'withdrawal',
          'purchase',
          'refund',
          'transfer',
          'fee',
          'cashback',
          'reversal',
          'adjustment',
          'payout',
          'commission',
        ],
        required: true,
      },

      status: {
        type: String,
        enum: [
          'pending',
          'processing',
          'completed',
          'failed',
          'cancelled',
          'reversed',
        ],
        required: true,
        index: true,
      },

      currency: {
        type: String,
        enum: [
          'INR',
          'NZD',
          'USD',
          'AUD',
          'GBP',
        ],
        required: true,
      },

      amount_minor: {
        type: Schema.Types.Long,
        required: true,
      },

      fee_minor: {
        type: Schema.Types.Long,
        required: true,
        default: 0,
      },

      net_amount_minor: {
        type: Schema.Types.Long,
        required: true,
      },

      idempotency_key: {
        type: String,
        sparse: true,
        index: true,
      },

      external_reference: {
        type: String,
        index: true,
      },

      reference_type: {
        type: String,
      },

      reference_id: {
        type: Schema.Types.ObjectId,
        index: true,
      },

      parent_transaction_id: {
        type: Schema.Types.ObjectId,
        ref: 'WalletTransaction',
        index: true,
      },

      transfer_id: {
        type: Schema.Types.ObjectId,
        ref: 'WalletTransfer',
        index: true,
      },

      description: {
        type: String,
        maxlength: 500,
      },

      metadata: {
        type: Schema.Types.Mixed,
      },

      failure_code: String,

      failure_reason: String,

      created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },

      processed_at: Date,

      completed_at: Date,
    },
    {
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    }
  );
```

Indexes:

```ts
WalletTransactionSchema.index({
  wallet_id: 1,
  created_at: -1,
});

WalletTransactionSchema.index({
  user_id: 1,
  created_at: -1,
});

WalletTransactionSchema.index({
  status: 1,
  created_at: -1,
});

WalletTransactionSchema.index({
  reference_type: 1,
  reference_id: 1,
});

WalletTransactionSchema.index({
  external_reference: 1,
});

WalletTransactionSchema.index(
  { idempotency_key: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotency_key: {
        $exists: true,
      },
    },
  }
);
```

---

# 9. Ledger Entry Model

This is the financial source of truth.

```ts
export interface IWalletLedgerEntry
  extends Document {

  _id: Types.ObjectId;

  entry_number: string;

  transaction_id: Types.ObjectId;

  account_id: Types.ObjectId;

  user_id?: Types.ObjectId;

  direction: LedgerDirection;

  amount_minor: Types.Long;

  currency: CurrencyCode;

  balance_before_minor: Types.Long;

  balance_after_minor: Types.Long;

  description?: string;

  reference_type?: string;

  reference_id?: Types.ObjectId;

  metadata?: Record<string, unknown>;

  created_at: Date;
}
```

Schema:

```ts
const WalletLedgerEntrySchema =
  new Schema<IWalletLedgerEntry>(
    {
      entry_number: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
      },

      transaction_id: {
        type: Schema.Types.ObjectId,
        ref: 'WalletTransaction',
        required: true,
        immutable: true,
        index: true,
      },

      account_id: {
        type: Schema.Types.ObjectId,
        ref: 'WalletAccount',
        required: true,
        immutable: true,
        index: true,
      },

      user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
      },

      direction: {
        type: String,
        enum: ['debit', 'credit'],
        required: true,
        immutable: true,
      },

      amount_minor: {
        type: Schema.Types.Long,
        required: true,
        immutable: true,
      },

      currency: {
        type: String,
        enum: [
          'INR',
          'NZD',
          'USD',
          'AUD',
          'GBP',
        ],
        required: true,
        immutable: true,
      },

      balance_before_minor: {
        type: Schema.Types.Long,
        required: true,
        immutable: true,
      },

      balance_after_minor: {
        type: Schema.Types.Long,
        required: true,
        immutable: true,
      },

      description: String,

      reference_type: String,

      reference_id: {
        type: Schema.Types.ObjectId,
      },

      metadata: Schema.Types.Mixed,

      created_at: {
        type: Date,
        default: Date.now,
        immutable: true,
      },
    },
    {
      timestamps: false,
    }
  );
```

Indexes:

```ts
WalletLedgerEntrySchema.index({
  account_id: 1,
  created_at: -1,
});

WalletLedgerEntrySchema.index({
  transaction_id: 1,
});

WalletLedgerEntrySchema.index({
  user_id: 1,
  created_at: -1,
});

WalletLedgerEntrySchema.index({
  reference_type: 1,
  reference_id: 1,
});
```

Prevent application-level mutation:

```ts
WalletLedgerEntrySchema.pre(
  [
    'updateOne',
    'updateMany',
    'findOneAndUpdate',
    'deleteOne',
    'deleteMany',
  ],
  function () {
    throw new Error(
      'Wallet ledger entries are immutable'
    );
  }
);
```

Historical ledger records must never be updated or deleted.

---

# 10. Wallet Hold Model

Use holds for withdrawals, order authorization, pending payments and similar operations.

```ts
export interface IWalletHold extends Document {
  _id: Types.ObjectId;

  wallet_account_id: Types.ObjectId;

  user_id: Types.ObjectId;

  amount_minor: Types.Long;

  currency: CurrencyCode;

  status: HoldStatus;

  reference_type: string;

  reference_id: Types.ObjectId;

  transaction_id?: Types.ObjectId;

  expires_at?: Date;

  released_at?: Date;

  captured_at?: Date;

  created_at: Date;

  updated_at: Date;
}
```

Schema:

```ts
const WalletHoldSchema =
  new Schema<IWalletHold>(
    {
      wallet_account_id: {
        type: Schema.Types.ObjectId,
        ref: 'WalletAccount',
        required: true,
        index: true,
      },

      user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },

      amount_minor: {
        type: Schema.Types.Long,
        required: true,
      },

      currency: {
        type: String,
        enum: [
          'INR',
          'NZD',
          'USD',
          'AUD',
          'GBP',
        ],
        required: true,
      },

      status: {
        type: String,
        enum: [
          'active',
          'released',
          'captured',
          'expired',
          'cancelled',
        ],
        required: true,
        index: true,
      },

      reference_type: {
        type: String,
        required: true,
      },

      reference_id: {
        type: Schema.Types.ObjectId,
        required: true,
      },

      transaction_id: {
        type: Schema.Types.ObjectId,
        ref: 'WalletTransaction',
      },

      expires_at: {
        type: Date,
        index: true,
      },

      released_at: Date,

      captured_at: Date,
    },
    {
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    }
  );
```

Indexes:

```ts
WalletHoldSchema.index({
  wallet_account_id: 1,
  status: 1,
});

WalletHoldSchema.index({
  reference_type: 1,
  reference_id: 1,
});

WalletHoldSchema.index({
  status: 1,
  expires_at: 1,
});
```

---

# 11. Wallet Transfer Model

```ts
export interface IWalletTransfer
  extends Document {

  _id: Types.ObjectId;

  transfer_number: string;

  from_account_id: Types.ObjectId;

  to_account_id: Types.ObjectId;

  from_user_id: Types.ObjectId;

  to_user_id: Types.ObjectId;

  currency: CurrencyCode;

  amount_minor: Types.Long;

  fee_minor: Types.Long;

  status: TransactionStatus;

  idempotency_key?: string;

  description?: string;

  created_at: Date;

  completed_at?: Date;
}
```

Indexes:

```ts
WalletTransferSchema.index(
  {
    transfer_number: 1,
  },
  {
    unique: true,
  }
);

WalletTransferSchema.index({
  from_user_id: 1,
  created_at: -1,
});

WalletTransferSchema.index({
  to_user_id: 1,
  created_at: -1,
});

WalletTransferSchema.index(
  {
    idempotency_key: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      idempotency_key: {
        $exists: true,
      },
    },
  }
);
```

---

# 12. Payment Webhook Event Model

External payment providers can send the same event more than once.

Create a dedicated idempotency record.

```ts
export interface IPaymentWebhookEvent
  extends Document {

  _id: Types.ObjectId;

  provider:
    | 'stripe'
    | 'razorpay'
    | 'adyen'
    | 'paypal'
    | 'other';

  event_id: string;

  event_type: string;

  payload_hash?: string;

  status:
    | 'received'
    | 'processing'
    | 'processed'
    | 'failed';

  attempts: number;

  transaction_id?: Types.ObjectId;

  failure_reason?: string;

  received_at: Date;

  processed_at?: Date;
}
```

Indexes:

```ts
PaymentWebhookEventSchema.index(
  {
    provider: 1,
    event_id: 1,
  },
  {
    unique: true,
  }
);

PaymentWebhookEventSchema.index({
  status: 1,
  received_at: 1,
});
```

---

# 13. Wallet Reconciliation Model

```ts
export interface IWalletReconciliation
  extends Document {

  _id: Types.ObjectId;

  provider: string;

  reconciliation_date: Date;

  currency: CurrencyCode;

  external_total_minor: Types.Long;

  ledger_total_minor: Types.Long;

  wallet_total_minor: Types.Long;

  discrepancy_minor: Types.Long;

  status:
    | 'matched'
    | 'discrepancy'
    | 'investigating'
    | 'resolved';

  notes?: string;

  created_at: Date;
}
```

Purpose:

```text
Payment Provider
      vs
Wallet Transactions
      vs
Ledger
      vs
Wallet Balance Projection
```

Example:

```text
Provider total:       ₹1,000,000
Ledger total:         ₹1,000,000
Wallet total:         ₹1,000,000
Discrepancy:                 ₹0
Status:                 matched
```

---

# 14. Wallet Adjustment Model

Admin adjustments must never directly edit wallet balances.

```ts
export interface IWalletAdjustment
  extends Document {

  _id: Types.ObjectId;

  wallet_id: Types.ObjectId;

  account_id: Types.ObjectId;

  transaction_id: Types.ObjectId;

  amount_minor: Types.Long;

  currency: CurrencyCode;

  direction: LedgerDirection;

  reason: string;

  requested_by: Types.ObjectId;

  approved_by?: Types.ObjectId;

  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'completed';

  created_at: Date;

  completed_at?: Date;
}
```

Large adjustments should support maker/checker approval.

---

# 15. Accounting Accounts

For a marketplace, support these account types:

```text
customer_wallet
provider_wallet

platform_cash
platform_revenue
platform_fee

payment_clearing
withdrawal_clearing
refund_liability
```

The system should distinguish user balances from platform accounting accounts.

---

# 16. Double-Entry Examples

## Deposit

Customer deposits ₹1,000.

```text
Payment Clearing       DEBIT   ₹1,000
Customer Wallet        CREDIT  ₹1,000
```

Debit total:

```text
₹1,000
```

Credit total:

```text
₹1,000
```

Balanced.

---

## Marketplace purchase

Customer pays ₹1,000.

Platform commission = ₹100.

Provider receives ₹900.

```text
Customer Wallet        DEBIT   ₹1,000
Provider Wallet        CREDIT    ₹900
Platform Revenue       CREDIT    ₹100
```

Balanced:

```text
DEBIT  = ₹1,000
CREDIT = ₹1,000
```

---

## Withdrawal

Provider withdraws ₹900.

```text
Provider Wallet        DEBIT   ₹900
Withdrawal Clearing    CREDIT  ₹900
```

After successful external payout:

```text
Withdrawal Clearing    DEBIT   ₹900
External Cash/Bank     CREDIT  ₹900
```

---

## Refund

Original purchase:

```text
Customer Wallet        DEBIT   ₹1,000
Provider Wallet        CREDIT   ₹900
Platform Revenue       CREDIT   ₹100
```

Refund:

```text
Customer Wallet        CREDIT  ₹1,000
Provider Wallet        DEBIT     ₹900
Platform Revenue       DEBIT     ₹100
```

Never modify the original transaction.

---

# 17. Marketplace Payment Flow

For a service marketplace:

```text
CUSTOMER
   │
   │ ₹1,000
   ▼
CUSTOMER WALLET
   │
   │ Hold ₹1,000
   ▼
ORDER
   │
   │ Service completed
   ▼
CAPTURE
   │
   ├───────────────┐
   ▼               ▼
PROVIDER         PLATFORM
₹900              ₹100
```

Provider money can remain pending until the service/order reaches the appropriate completed state.

---

# 18. Wallet Service

Create one central wallet service.

```ts
class WalletService {

  async credit(params: CreditParams) {}

  async debit(params: DebitParams) {}

  async hold(params: HoldParams) {}

  async releaseHold(
    params: ReleaseHoldParams
  ) {}

  async captureHold(
    params: CaptureHoldParams
  ) {}

  async transfer(
    params: TransferParams
  ) {}

  async refund(
    params: RefundParams
  ) {}

  async reverse(
    params: ReverseParams
  ) {}

  async reconcile(
    params: ReconcileParams
  ) {}
}
```

No order, payment, withdrawal or user service should directly modify wallet balances.

---

# 19. MongoDB Transaction Helper

Create a reusable transaction helper.

```ts
export async function withWalletTransaction<T>(
  callback: (
    session: ClientSession
  ) => Promise<T>
): Promise<T> {

  const session =
    await mongoose.startSession();

  try {

    let result!: T;

    await session.withTransaction(
      async () => {
        result =
          await callback(session);
      },
      {
        readConcern: {
          level: 'snapshot',
        },

        writeConcern: {
          w: 'majority',
        },

        readPreference: 'primary',
      }
    );

    return result;

  } finally {
    await session.endSession();
  }
}
```

Production MongoDB must support transactions, such as a replica set or supported sharded deployment.

---

# 20. Credit Flow

All of these must happen in one MongoDB transaction:

```text
START TRANSACTION

Validate wallet/account
        ↓
Validate currency
        ↓
Validate amount
        ↓
Validate idempotency
        ↓
Create wallet transaction
        ↓
Atomically update wallet balance
        ↓
Create ledger entry
        ↓
Mark transaction completed
        ↓
COMMIT
```

Never update the balance without creating the corresponding ledger entry.

---

# 21. Debit Flow

Use a conditional atomic update.

Concept:

```ts
const updated =
  await WalletAccountModel.findOneAndUpdate(
    {
      _id: accountId,
      status: 'active',
      available_balance_minor: {
        $gte: amountMinor,
      },
    },
    {
      $inc: {
        available_balance_minor: -amountMinor,
        version: 1,
      },
    },
    {
      new: true,
      session,
    }
  );

if (!updated) {
  throw new InsufficientBalanceError();
}
```

This prevents two concurrent requests from spending the same balance.

Do NOT use:

```ts
const account = await Account.findById(id);

account.available_balance_minor -= amount;

await account.save();
```

for critical financial debits.

---

# 22. Concurrency Protection

Example:

```text
Balance = ₹1,000

Request A → debit ₹700
Request B → debit ₹700
```

Both must not succeed.

Atomic conditional update:

```text
A checks >= ₹700 → succeeds → ₹300

B checks >= ₹700 → fails
```

The second request receives:

```text
INSUFFICIENT_BALANCE
```

MongoDB transaction + atomic conditional balance update must be used for critical wallet mutations.

---

# 23. Idempotency

Require an idempotency key for:

```text
deposit
withdrawal
transfer
refund
adjustment
```

Example:

```http
Idempotency-Key: transfer-user123-20260821-001
```

Store it in the relevant transaction.

Create a unique partial index:

```ts
WalletTransactionSchema.index(
  { idempotency_key: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotency_key: {
        $exists: true,
      },
    },
  }
);
```

If the same request arrives again, return the existing transaction/result instead of performing another financial movement.

---

# 24. Deposit Flow

Never credit a wallet just because the frontend says payment succeeded.

Correct flow:

```text
Frontend
   ↓
Create Deposit / Payment Intent
   ↓
Payment Provider
   ↓
Customer Pays
   ↓
Payment Provider Webhook
   ↓
Verify Webhook Signature
   ↓
Check Provider Event ID
   ↓
Check Idempotency
   ↓
Start Mongo Transaction
   ↓
Create/complete Wallet Transaction
   ↓
Create Ledger Entries
   ↓
Update Wallet Account
   ↓
Commit
```

Frontend must NOT be trusted to confirm payment.

---

# 25. Withdrawal Flow

API:

```text
POST /api/v1/wallet/withdrawals
```

Flow:

```text
Validate user
      ↓
Validate wallet
      ↓
Validate KYC/withdrawal eligibility
      ↓
Validate bank/payout account
      ↓
Check available balance
      ↓
Create lock/hold
      ↓
Create withdrawal transaction
      ↓
Send payout request
      ↓
Receive provider webhook
      ↓
Success → capture hold
Failure → release hold
```

Withdrawal states:

```text
requested
   ↓
pending
   ↓
processing
   ├──→ completed
   └──→ failed
```

---

# 26. Transfer Flow

Example:

```text
User A → User B
₹500
```

Use one MongoDB transaction:

```text
START TRANSACTION

Validate sender
Validate receiver
Validate currency
Validate account status
Check sender balance

        ↓

Debit sender

        ↓

Credit receiver

        ↓

Create transfer

        ↓

Create sender ledger entry

        ↓

Create receiver ledger entry

        ↓

COMMIT
```

If anything fails:

```text
ROLLBACK
```

Sender must never lose money without receiver/platform accounting receiving the corresponding entry.

---

# 27. Refunds

Never modify an existing completed transaction.

Original:

```text
TXN-1001
purchase
DEBIT ₹500
```

Refund:

```text
TXN-1050
refund
CREDIT ₹500

parent_transaction_id = TXN-1001
```

The original transaction remains immutable.

---

# 28. Reversals

Never modify the original transaction.

Example:

```text
Deposit
CREDIT ₹1,000
```

Provider later reverses payment:

```text
Reversal
DEBIT ₹1,000
parent_transaction_id = original deposit
```

---

# 29. Transaction State Machine

Valid transitions:

```text
pending
   ↓
processing
   ├──→ completed
   └──→ failed
```

Completed transactions may later become:

```text
completed
    ↓
reversed
```

Do not allow arbitrary transitions such as:

```text
completed → pending
failed → completed
cancelled → processing
```

Implement:

```ts
validateTransactionTransition(
  currentStatus,
  nextStatus
)
```

---

# 30. Payment Webhook Flow

Webhook endpoint:

```text
POST /api/v1/webhooks/payment-provider
```

Processing:

```text
Raw request
    ↓
Verify provider signature
    ↓
Extract event ID
    ↓
Check duplicate
    ↓
Persist webhook event
    ↓
Process event
    ↓
Create/update transaction
    ↓
Create ledger
    ↓
Update balance
    ↓
Mark webhook processed
```

Webhook events must be idempotent.

If a provider sends the same event three times, the wallet must only be credited once.

---

# 31. API Endpoints

## User Wallet

```text
GET /api/v1/wallet
GET /api/v1/wallet/accounts
GET /api/v1/wallet/accounts/:currency
GET /api/v1/wallet/balance
```

## Deposits

```text
POST /api/v1/wallet/deposits
GET  /api/v1/wallet/deposits/:id
```

## Withdrawals

```text
POST /api/v1/wallet/withdrawals
GET  /api/v1/wallet/withdrawals
GET  /api/v1/wallet/withdrawals/:id
POST /api/v1/wallet/withdrawals/:id/cancel
```

## Transfers

```text
POST /api/v1/wallet/transfers
GET  /api/v1/wallet/transfers
GET  /api/v1/wallet/transfers/:id
```

## Transactions

```text
GET /api/v1/wallet/transactions
GET /api/v1/wallet/transactions/:id
```

## Ledger

```text
GET /api/v1/wallet/ledger
```

## Internal Holds

```text
POST /api/v1/internal/wallet/holds
POST /api/v1/internal/wallet/holds/:id/release
POST /api/v1/internal/wallet/holds/:id/capture
```

## Webhooks

```text
POST /api/v1/webhooks/stripe
POST /api/v1/webhooks/razorpay
POST /api/v1/webhooks/adyen
```

Only implement providers actually used by the application.

---

# 32. Admin APIs

```text
GET  /api/v1/admin/wallets
GET  /api/v1/admin/wallets/:walletId

POST /api/v1/admin/wallets/:walletId/freeze
POST /api/v1/admin/wallets/:walletId/unfreeze

GET  /api/v1/admin/wallet-transactions
GET  /api/v1/admin/wallet-ledger

POST /api/v1/admin/wallet-adjustments

GET  /api/v1/admin/wallet-reconciliation
```

Admin adjustment must require:

```text
Admin authorization
      ↓
Reason
      ↓
Adjustment record
      ↓
Approval if required
      ↓
Wallet transaction
      ↓
Ledger
```

Never directly edit `available_balance_minor`.

---

# 33. Joi Validation

Example transfer validator:

```ts
export const walletTransferValidator =
  Joi.object({
    recipient_user_id: Joi.string()
      .custom(objectIdValidator)
      .required(),

    amount_minor: Joi.number()
      .integer()
      .positive()
      .required(),

    currency: Joi.string()
      .valid(
        'INR',
        'NZD',
        'USD',
        'AUD',
        'GBP'
      )
      .required(),

    description: Joi.string()
      .trim()
      .max(500)
      .optional(),

    idempotency_key: Joi.string()
      .trim()
      .max(100)
      .required(),
  });
```

Also implement server-side:

- currency-specific amount limits
- wallet status checks
- transaction limits
- daily limits
- KYC restrictions
- withdrawal restrictions
- account ownership checks

---

# 34. Folder Structure

Implement the module as:

```text
src/
└── modules/
    └── wallet/
        │
        ├── controllers/
        │   ├── wallet.controller.ts
        │   ├── deposit.controller.ts
        │   ├── withdrawal.controller.ts
        │   ├── transfer.controller.ts
        │   └── webhook.controller.ts
        │
        ├── services/
        │   ├── wallet.service.ts
        │   ├── wallet-account.service.ts
        │   ├── wallet-ledger.service.ts
        │   ├── wallet-deposit.service.ts
        │   ├── wallet-withdrawal.service.ts
        │   ├── wallet-transfer.service.ts
        │   ├── wallet-refund.service.ts
        │   ├── wallet-hold.service.ts
        │   ├── wallet-reversal.service.ts
        │   └── wallet-reconciliation.service.ts
        │
        ├── models/
        │   ├── wallet.model.ts
        │   ├── wallet-account.model.ts
        │   ├── wallet-transaction.model.ts
        │   ├── wallet-ledger-entry.model.ts
        │   ├── wallet-hold.model.ts
        │   ├── wallet-transfer.model.ts
        │   ├── wallet-adjustment.model.ts
        │   ├── wallet-reconciliation.model.ts
        │   └── payment-webhook-event.model.ts
        │
        ├── validators/
        │   ├── wallet.validator.ts
        │   ├── deposit.validator.ts
        │   ├── withdrawal.validator.ts
        │   └── transfer.validator.ts
        │
        ├── types/
        │   ├── wallet.types.ts
        │   ├── transaction.types.ts
        │   └── ledger.types.ts
        │
        ├── routes/
        │   └── wallet.routes.ts
        │
        └── utils/
            ├── transaction-number.ts
            ├── idempotency.ts
            └── money.ts
```

---

# 35. Service Boundaries

Only the wallet module may mutate wallet balances.

Recommended central service:

```ts
WalletLedgerService
```

Methods:

```ts
credit()
debit()
hold()
releaseHold()
captureHold()
transfer()
refund()
reverse()
```

Other application modules must call wallet services.

Example:

```ts
await walletService.capturePayment({
  orderId,
  customerAccountId,
  providerAccountId,
  amountMinor,
  commissionMinor,
  session,
});
```

The order service must NOT do:

```ts
wallet.available_balance_minor -= amount;
```

---

# 36. Marketplace Payment

Recommended marketplace flow:

```text
Customer Wallet
      │
      │ Hold ₹1,000
      ▼
Order Created
      │
      │ Service Completed
      ▼
Capture
      │
      ├───────────────┐
      ▼               ▼
Provider Wallet    Platform Revenue
₹900               ₹100
```

Provider funds can remain pending until the service/order reaches the configured completion/release state.

---

# 37. Provider Earnings

Support:

```text
provider_wallet
provider_pending_earnings
```

Conceptually:

```text
Customer Payment
       ↓
Payment Clearing
       ↓
Pending Provider Earnings
       ↓
Service Completed
       ↓
Provider Available Balance
       ↓
Withdrawal
```

This allows the platform to handle:

- service completion
- cancellation
- refunds
- disputes
- fraud checks
- payout delays

---

# 38. Production Safety Rules

These are mandatory:

1. Never use JavaScript floating-point numbers for money.
2. Never directly edit wallet balances outside the wallet module.
3. Never delete ledger entries.
4. Never modify historical ledger entries.
5. Every financial movement gets a transaction.
6. Every completed financial movement gets ledger entries.
7. Every money movement must be idempotent where retries are possible.
8. Balance mutation + ledger creation must be atomic.
9. Payment webhooks must be signature-verified.
10. Webhook events must be idempotent.
11. Withdrawals must use holds.
12. Refunds create new transactions.
13. Reversals create new transactions.
14. Transfers must be atomic.
15. Admin adjustments require audit records.
16. Use MongoDB transactions with majority write concern.
17. Use conditional atomic balance updates for debits.
18. Reconcile periodically against payment providers.
19. Separate customer/provider/platform accounting accounts.
20. Keep financial records auditable.
21. Do not expose ledger mutation APIs to users.
22. Do not trust frontend payment-success messages.
23. Validate ownership of every wallet/account/reference.
24. Enforce currency consistency.
25. Enforce transaction state transitions.
26. Log security-relevant wallet events.
27. Never log full payment credentials or sensitive financial secrets.
28. Use authorization and role checks on admin/internal endpoints.

---

# 39. Implementation Order

Implement in this order:

## Phase 1 - Foundation

- Money utility
- Currency configuration
- Common wallet types
- Wallet model
- Wallet account model
- Indexes

## Phase 2 - Ledger

- Transaction model
- Ledger entry model
- Ledger service
- Immutable ledger protection
- Double-entry validation

## Phase 3 - Core wallet operations

- Credit
- Debit
- Balance queries
- Holds
- Release hold
- Capture hold
- Transaction state machine

## Phase 4 - Transfers

- Transfer model
- Atomic wallet-to-wallet transfer
- Idempotency
- Concurrency protection

## Phase 5 - Payments

- Deposit transaction
- Payment provider adapter
- Payment webhook event model
- Webhook verification
- Webhook idempotency
- Deposit reconciliation

## Phase 6 - Withdrawals

- Withdrawal transaction
- Withdrawal hold
- Payout provider adapter
- Payout webhook
- Success/failure handling

## Phase 7 - Marketplace accounting

- Customer wallet
- Provider pending earnings
- Provider available balance
- Platform commission
- Platform fees
- Order payment capture

## Phase 8 - Refunds and reversals

- Refund transaction
- Partial refunds
- Full refunds
- Reversal transaction
- Parent transaction relationships

## Phase 9 - Admin and reconciliation

- Admin freeze/unfreeze
- Admin adjustment
- Approval workflow
- Reconciliation
- Discrepancy reporting

## Phase 10 - Testing

Write tests for:

- Credit
- Debit
- Insufficient balance
- Concurrent debit
- Transfer
- Duplicate transfer
- Duplicate webhook
- Failed withdrawal
- Successful withdrawal
- Hold/release
- Hold/capture
- Refund
- Partial refund
- Reversal
- Admin adjustment
- Transaction rollback
- Ledger balancing
- Currency mismatch
- Closed/frozen wallet
- Invalid state transition

---

# 40. Critical Test Cases

## Concurrent debit

Initial:

```text
₹1,000
```

Two simultaneous:

```text
Debit ₹700
Debit ₹700
```

Expected:

```text
First succeeds
Second fails
Final balance = ₹300
```

## Duplicate webhook

Webhook received twice:

```text
event_id = evt_123
```

Expected:

```text
One wallet credit only.
Two webhook deliveries may exist, but only one financial transaction is processed.
```

## Transfer rollback

Sender:

```text
₹1,000
```

Transfer:

```text
₹500
```

Receiver credit fails.

Expected:

```text
Sender remains ₹1,000
Receiver unchanged
No completed transfer
No partial ledger
```

## Refund

Purchase:

```text
₹1,000
```

Refund:

```text
₹400
```

Expected:

```text
Original transaction remains unchanged.
New refund transaction = ₹400.
Customer receives ₹400.
```

---

# 41. Important Implementation Note

Do not blindly copy the sample code into production and consider the wallet complete.

The implementation must additionally include:

- Proper Mongoose `Long` serialization handling
- Currency-specific limits
- Strong request authorization
- Provider signature verification
- Provider-specific webhook semantics
- Payment reconciliation
- Withdrawal/payout reconciliation
- Retry handling
- Idempotency race handling
- Transaction retry handling
- MongoDB transient transaction error handling
- Audit logging
- Monitoring/alerting
- Fraud/risk controls
- KYC/AML integration where applicable
- Compliance requirements for the target jurisdiction

---

# 42. Definition of Done

The wallet implementation is considered complete only when:

- [ ] Wallet creation works
- [ ] Currency account creation works
- [ ] Balance queries work
- [ ] Credit works atomically
- [ ] Debit works atomically
- [ ] Insufficient balance is prevented
- [ ] Concurrent spending is prevented
- [ ] Holds work
- [ ] Holds can be released
- [ ] Holds can be captured
- [ ] Transfers are atomic
- [ ] Transfers are idempotent
- [ ] Deposits are confirmed by verified provider webhooks
- [ ] Duplicate webhooks cannot double-credit
- [ ] Withdrawals use locked funds
- [ ] Withdrawal failures release locked funds
- [ ] Successful withdrawals capture locked funds
- [ ] Refunds create separate transactions
- [ ] Reversals create separate transactions
- [ ] Provider pending earnings are supported
- [ ] Platform commissions are supported
- [ ] Double-entry ledger is enforced
- [ ] Ledger entries are immutable
- [ ] Admin adjustments are audited
- [ ] Transaction state transitions are validated
- [ ] Reconciliation is implemented
- [ ] Required indexes exist
- [ ] Joi validation exists
- [ ] Unit tests exist
- [ ] Integration tests exist
- [ ] MongoDB transaction rollback tests exist
- [ ] Concurrency tests exist
- [ ] Idempotency tests exist
- [ ] Webhook tests exist
- [ ] Security/authorization tests exist

---

# 43. Final Architecture

```text
                         USER
                           │
                           ▼
                        WALLET
                           │
                           ▼
                    WALLET ACCOUNT
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
          AVAILABLE      PENDING      LOCKED
              │            │            │
              └────────────┼────────────┘
                           ▼
                      TRANSACTION
                           │
                           ▼
                    LEDGER ENTRIES
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
         CUSTOMER       PROVIDER       PLATFORM
          ACCOUNT        ACCOUNT        ACCOUNT
             │             │             │
             └─────────────┼─────────────┘
                           │
                           ▼
                   RECONCILIATION
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
      PAYMENT PROVIDER              INTERNAL LEDGER
```

The core principle is:

```text
                 DO NOT TRUST BALANCE

                      TRANSACTION
                           ↓
                   DOUBLE-ENTRY LEDGER
                           ↓
                  BALANCE PROJECTION
```

The wallet module should be the single authority responsible for all money movement in the application.
