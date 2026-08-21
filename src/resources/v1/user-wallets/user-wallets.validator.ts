import { objectIdValidator } from "@/utils/responses/error.response";
import Joi from "joi";

export const getAccountByCurrencyValidator = Joi.object({
  currency: Joi.string()
    .valid("INR", "NZD", "USD", "AUD", "GBP")
    .required()
    .messages({
      "any.required": "Currency is required",
      "any.only": "Currency must be one of INR, NZD, USD, AUD, GBP",
    }),
});

export const getBalanceValidator = Joi.object({
  currency: Joi.string()
    .valid("INR", "NZD", "USD", "AUD", "GBP")
    .optional()
    .messages({
      "any.only": "Currency must be one of INR, NZD, USD, AUD, GBP",
    }),
});

export const createDepositValidator = Joi.object({
  amount_minor: Joi.number().integer().positive().required().messages({
    "any.required": "amount_minor is required",
    "number.base": "amount_minor must be a number",
    "number.integer": "amount_minor must be an integer in minor units",
    "number.positive": "amount_minor must be greater than 0",
  }),
  currency: Joi.string()
    .valid("INR", "NZD", "USD", "AUD", "GBP")
    .required()
    .messages({
      "any.required": "Currency is required",
      "any.only": "Currency must be one of INR, NZD, USD, AUD, GBP",
    }),
  provider: Joi.string().valid("stripe", "paypal").required().messages({
    "any.required": "Provider is required",
    "any.only": "Provider must be stripe or paypal",
  }),
  idempotency_key: Joi.string().trim().max(100).required().messages({
    "any.required": "Idempotency key is required",
    "string.max": "Idempotency key cannot exceed 100 characters",
  }),
  description: Joi.string().trim().max(500).optional(),
  metadata: Joi.object().optional(),
});

export const createWithdrawalValidator = Joi.object({
  amount_minor: Joi.number().integer().positive().required().messages({
    "any.required": "amount_minor is required",
    "number.base": "amount_minor must be a number",
    "number.integer": "amount_minor must be an integer in minor units",
    "number.positive": "amount_minor must be greater than 0",
  }),
  currency: Joi.string()
    .valid("INR", "NZD", "USD", "AUD", "GBP")
    .required()
    .messages({
      "any.required": "Currency is required",
      "any.only": "Currency must be one of INR, NZD, USD, AUD, GBP",
    }),
  provider: Joi.string().valid("stripe", "paypal").required().messages({
    "any.required": "Provider is required",
    "any.only": "Provider must be stripe or paypal",
  }),
  payout_destination: Joi.string().trim().required().messages({
    "any.required": "payout_destination is required",
  }),
  idempotency_key: Joi.string().trim().max(100).required().messages({
    "any.required": "Idempotency key is required",
    "string.max": "Idempotency key cannot exceed 100 characters",
  }),
  description: Joi.string().trim().max(500).optional(),
});

export const listWithdrawalsValidator = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});

export const createHoldValidator = Joi.object({
  wallet_account_id: Joi.string().custom(objectIdValidator).required().messages({
    "any.required": "wallet_account_id is required",
  }),
  amount_minor: Joi.number().integer().positive().required().messages({
    "any.required": "amount_minor is required",
    "number.base": "amount_minor must be a number",
    "number.integer": "amount_minor must be an integer in minor units",
    "number.positive": "amount_minor must be greater than 0",
  }),
  currency: Joi.string()
    .valid("INR", "NZD", "USD", "AUD", "GBP")
    .required()
    .messages({
      "any.required": "Currency is required",
      "any.only": "Currency must be one of INR, NZD, USD, AUD, GBP",
    }),
  reference_type: Joi.string().trim().required().messages({
    "any.required": "reference_type is required",
  }),
  reference_id: Joi.string().custom(objectIdValidator).required().messages({
    "any.required": "reference_id is required",
  }),
  expires_at: Joi.date().iso().optional(),
  description: Joi.string().trim().max(500).optional(),
});

export const listHoldsValidator = Joi.object({
  status: Joi.string()
    .valid("active", "released", "captured", "expired", "cancelled")
    .optional(),
});

export const releaseHoldValidator = Joi.object({
  reason: Joi.string().trim().max(500).optional(),
});

export const captureHoldValidator = Joi.object({
  capture_amount_minor: Joi.number().integer().positive().optional(),
  description: Joi.string().trim().max(500).optional(),
});

export const createTransferValidator = Joi.object({
  to_user_id: Joi.string().custom(objectIdValidator).required().messages({
    "any.required": "to_user_id is required",
  }),
  amount_minor: Joi.number().integer().positive().required().messages({
    "any.required": "amount_minor is required",
    "number.base": "amount_minor must be a number",
    "number.integer": "amount_minor must be an integer in minor units",
    "number.positive": "amount_minor must be greater than 0",
  }),
  currency: Joi.string()
    .valid("INR", "NZD", "USD", "AUD", "GBP")
    .required()
    .messages({
      "any.required": "Currency is required",
      "any.only": "Currency must be one of INR, NZD, USD, AUD, GBP",
    }),
  fee_minor: Joi.number().integer().min(0).optional().default(0),
  description: Joi.string().trim().max(500).optional(),
  idempotency_key: Joi.string().trim().max(100).required().messages({
    "any.required": "Idempotency key is required",
  }),
});

export const listTransfersValidator = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});

export const createRefundValidator = Joi.object({
  parent_transaction_id: Joi.string().custom(objectIdValidator).required().messages({
    "any.required": "parent_transaction_id is required",
  }),
  amount_minor: Joi.number().integer().positive().required().messages({
    "any.required": "amount_minor is required",
    "number.base": "amount_minor must be a number",
    "number.integer": "amount_minor must be an integer in minor units",
    "number.positive": "amount_minor must be greater than 0",
  }),
  currency: Joi.string()
    .valid("INR", "NZD", "USD", "AUD", "GBP")
    .required()
    .messages({
      "any.required": "Currency is required",
      "any.only": "Currency must be one of INR, NZD, USD, AUD, GBP",
    }),
  reason: Joi.string().trim().max(500).optional(),
  idempotency_key: Joi.string().trim().max(100).required().messages({
    "any.required": "Idempotency key is required",
  }),
});

export const listRefundsValidator = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});

export const createReversalValidator = Joi.object({
  parent_transaction_id: Joi.string().custom(objectIdValidator).required().messages({
    "any.required": "parent_transaction_id is required",
  }),
  amount_minor: Joi.number().integer().positive().required().messages({
    "any.required": "amount_minor is required",
    "number.base": "amount_minor must be a number",
    "number.integer": "amount_minor must be an integer in minor units",
    "number.positive": "amount_minor must be greater than 0",
  }),
  currency: Joi.string()
    .valid("INR", "NZD", "USD", "AUD", "GBP")
    .required()
    .messages({
      "any.required": "Currency is required",
      "any.only": "Currency must be one of INR, NZD, USD, AUD, GBP",
    }),
  reason: Joi.string().trim().max(500).optional(),
  external_reference: Joi.string().trim().optional(),
  idempotency_key: Joi.string().trim().max(100).optional(),
});

export const listReversalsValidator = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});

export const listTransactionsValidator = Joi.object({
  wallet_id: Joi.string().custom(objectIdValidator).optional(),
  type: Joi.string().optional(),
  status: Joi.string().optional(),
  currency: Joi.string().valid("INR", "NZD", "USD", "AUD", "GBP").optional(),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
  sort_by: Joi.string().optional().default("createdAt"),
  sort_order: Joi.string().valid("asc", "desc").optional().default("desc"),
});

export const listLedgerValidator = Joi.object({
  account_id: Joi.string().custom(objectIdValidator).optional(),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});
