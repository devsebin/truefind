import Joi from "joi";
import { objectIdValidator } from "@/utils/responses/error.response";
import { timeUnits } from "@/database/services/services-db-interface";

export const bundleAreaConfigCreateSchema = Joi.object({
  country_configuration_id: Joi.string()
    .required()
    .custom(objectIdValidator)
    .messages({
      "any.required": "country_configuration_id is required",
      "string.custom": "country_configuration_id must be a valid MongoDB ObjectId",
    }),

  suburb_ids: Joi.array()
    .items(
      Joi.string()
        .required()
        .custom(objectIdValidator)
        .messages({
          "any.required": "suburb_id is required",
          "string.custom": "suburb_id must be a valid MongoDB ObjectId",
        }),
    )
    .min(1)
    .required()
    .messages({
      "any.required": "suburb_ids is required",
      "array.min": "At least one suburb_id is required",
    }),
});

export const bundleAreaConfigUpdateSchema = Joi.object({
  is_callout_bundle: Joi.boolean().optional(),

  call_out_fee: Joi.number()
    .when("is_callout_bundle", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required": "call_out_fee is required when is_callout_bundle is true",
      "any.unknown": "call_out_fee is not allowed when is_callout_bundle is false",
    }),

  is_fixed_price: Joi.boolean()
    .optional()
    .when("is_callout_bundle", {
      is: true,
      then: Joi.valid(false).messages({
        "any.only": "is_fixed_price must be false when is_callout_bundle is true",
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
      "any.unknown": "price is not allowed when is_fixed_price is false",
    }),

  unit_id: Joi.string()
    .optional()
    .custom(objectIdValidator)
    .messages({
      "string.custom": "unit_id must be a valid MongoDB ObjectId",
    }),

  currency_id: Joi.string()
    .optional()
    .custom(objectIdValidator)
    .messages({
      "string.custom": "currency_id must be a valid MongoDB ObjectId",
    }),

  minimum_price: Joi.number().optional(),
  maximum_price: Joi.number().optional(),

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
