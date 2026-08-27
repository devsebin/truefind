import Joi from "joi";
import { objectIdValidator } from "@/utils/responses/error.response";
import { timeUnits } from "@/database/services/services-db-interface";

export const bundleCountryConfigCreateSchema = Joi.object({
  bundle_id: Joi.string()
    .required()
    .custom(objectIdValidator)
    .messages({
      "any.required": "bundle_id is required",
      "string.custom": "bundle_id must be a valid MongoDB ObjectId",
    }),

  country_id: Joi.string()
    .required()
    .custom(objectIdValidator)
    .messages({
      "any.required": "country_id is required",
      "string.custom": "country_id must be a valid MongoDB ObjectId",
    }),

  currency_id: Joi.string()
    .required()
    .custom(objectIdValidator)
    .messages({
      "any.required": "currency_id is required",
      "string.custom": "currency_id must be a valid MongoDB ObjectId",
    }),

  is_callout_bundle: Joi.boolean().required(),

  call_out_fee: Joi.number()
    .when("is_callout_bundle", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required":
        "call_out_fee is required when is_callout_bundle is true",
      "any.unknown":
        "call_out_fee is not allowed when is_callout_bundle is false",
    }),

  is_fixed_price: Joi.boolean()
    .required()
    .when("is_callout_bundle", {
      is: true,
      then: Joi.valid(false).messages({
        "any.only":
          "is_fixed_price must be false when is_callout_bundle is true",
      }),
    }),

  // Fixed price
  price: Joi.number()
    .when("is_fixed_price", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required": "price is required when is_fixed_price is true",
      "any.unknown": "price is not allowed when is_fixed_price is false",
    }),

  unit_id: Joi.string()
    .custom(objectIdValidator)
    .optional()
    .messages({
      "string.custom": "unit_id must be a valid MongoDB ObjectId",
    }),

  // Non-fixed/unit price
  minimum_price: Joi.number()
    .when("is_callout_bundle", {
      is: false,
      then: Joi.forbidden(),
      otherwise: Joi.required(),
    })
    .messages({
      "any.unknown": "minimum_price is not allowed when is_callout_bundle is false",
    }),

  maximum_price: Joi.number()
    .when("is_callout_bundle", {
      is: false,
      then: Joi.forbidden(),
      otherwise: Joi.required(),
    })
    .messages({
      "any.unknown": "maximum_price is not allowed when is_callout_bundle is false",
    }),

  // Time estimations
  estimated_time: Joi.number().optional(),

  estimated_time_unit: Joi.string()
    .valid(...Object.values(timeUnits))
    .optional(),

  individual_services_total: Joi.number().optional(),

  bundle_discount_type: Joi.string()
    .valid("FIXED", "PERCENTAGE", "NONE")
    .optional(),

  bundle_discount_value: Joi.number().optional(),
});

export const bundleCountryConfigUpdateSchema = Joi.object({
  bundle_id: Joi.string()
    .optional()
    .custom(objectIdValidator)
    .messages({
      "string.custom": "bundle_id must be a valid MongoDB ObjectId",
    }),

  country_id: Joi.string()
    .optional()
    .custom(objectIdValidator)
    .messages({
      "string.custom": "country_id must be a valid MongoDB ObjectId",
    }),

  currency_id: Joi.string()
    .optional()
    .custom(objectIdValidator)
    .messages({
      "string.custom": "currency_id must be a valid MongoDB ObjectId",
    }),

  unit_id: Joi.string()
    .optional()
    .custom(objectIdValidator)
    .messages({
      "string.custom": "unit_id must be a valid MongoDB ObjectId",
    }),

  is_callout_bundle: Joi.boolean().optional(),

  call_out_fee: Joi.number()
    .when("is_callout_bundle", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required":
        "call_out_fee is required when is_callout_bundle is true",
      "any.unknown":
        "call_out_fee is not allowed when is_callout_bundle is false",
    }),

  is_fixed_price: Joi.boolean()
    .optional()
    .when("is_callout_bundle", {
      is: true,
      then: Joi.valid(false).messages({
        "any.only":
          "is_fixed_price must be false when is_callout_bundle is true",
      }),
    }),

  price: Joi.number()
    .when("is_fixed_price", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required": "price is required when is_fixed_price is true",
      "any.unknown":
        "price is not allowed when is_fixed_price is false",
    }),

  minimum_price: Joi.number()
    .when("is_callout_bundle", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required":
        "minimum_price is required when is_callout_bundle is true",
      "any.unknown":
        "minimum_price is not allowed when is_callout_bundle is false",
    }),

  maximum_price: Joi.number()
    .when("is_callout_bundle", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required":
        "maximum_price is required when is_callout_bundle is true",
      "any.unknown":
        "maximum_price is not allowed when is_callout_bundle is false",
    }),

  estimated_time: Joi.number().optional(),

  estimated_time_unit: Joi.string()
    .valid(...Object.values(timeUnits))
    .optional(),

  individual_services_total: Joi.number().optional(),

  bundle_discount_type: Joi.string()
    .valid("FIXED", "PERCENTAGE", "NONE")
    .optional(),

  bundle_discount_value: Joi.number().optional(),

  is_active: Joi.boolean().optional(),
});

