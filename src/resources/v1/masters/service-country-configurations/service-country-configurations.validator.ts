import Joi from "joi";
import { objectIdValidator } from "@/utils/responses/error.response";
import { timeUnits } from "@/database/services/services-db-interface";

export const serviceCountryConfigCreateSchema = Joi.object({
  service_id: Joi.string()
    .required()
    .custom(objectIdValidator)
    .messages({
      "any.required": "service_id is required",
      "string.custom": "service_id must be a valid MongoDB ObjectId",
    }),

  country_id: Joi.string()
    .required()
    .custom(objectIdValidator)
    .messages({
      "any.required": "country_id is required",
      "string.custom": "country_id must be a valid MongoDB ObjectId",
    }),

  currency_id: Joi.string()
    .custom(objectIdValidator)
    .when("is_callout_service", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.required(),
    })
    .messages({
      "any.required": "currency_id is required",
      "string.custom": "currency_id must be a valid MongoDB ObjectId",
    }),

  required_licenses: Joi.boolean().required(),

  is_callout_service: Joi.boolean().required(),
  call_out_fee: Joi.number()
    .when("is_callout_service", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required":
        "call_out_fee is required when is_callout_service is true",
      "any.unknown":
        "call_out_fee is not allowed when is_callout_service is false",
    }),


  is_fixed_price: Joi.boolean()
    .required()
    .when("is_callout_service", {
      is: true,
      then: Joi.valid(false).messages({
        "any.only":
          "is_fixed_price must be false when is_callout_service is true",
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
      "any.required":
        "price is required when is_fixed_price is true",
      "any.unknown":
        "price is not allowed when is_fixed_price is false",
    }),


  unit_id: Joi.string()
    .custom(objectIdValidator)
    .when("is_callout_service", {
      is: false,
      then: Joi.required(),
      otherwise: Joi.required(),
    })
    .messages({
      "any.required": "unit_id is required",
      "string.custom": "unit_id must be a valid MongoDB ObjectId",
    }),

  // Non-fixed/unit price
  minimum_unit_price: Joi.number()
    .when("is_callout_service", {
      is: false,
      then: Joi.forbidden(),
      otherwise: Joi.optional(),
    }),

  maximum_unit_price: Joi.number()
    .when("is_callout_service", {
      is: false,
      then: Joi.forbidden(),
      otherwise: Joi.optional(),
    }),

  // Callout service
  estimated_time: Joi.number().optional(),

  estimated_time_unit: Joi.string()
    .valid(...Object.values(timeUnits))
    .optional(),
});

export const serviceCountryConfigUpdateSchema = Joi.object({
  service_id: Joi.string().optional().custom(objectIdValidator),
  country_id: Joi.string().optional().custom(objectIdValidator),
  required_licenses: Joi.boolean().optional(),
  is_callout_service: Joi.boolean().optional(),
  is_fixed_price: Joi.boolean().optional(),
  currency_id: Joi.string().optional().custom(objectIdValidator),
  price: Joi.number().optional(),
  unit_id: Joi.string().optional().custom(objectIdValidator),
  task_unit_price: Joi.number().optional(),
  minimum_unit_price: Joi.number().optional(),
  maximum_unit_price: Joi.number().optional(),
  call_out_fee: Joi.number().optional(),
  estimated_time: Joi.number().optional(),
  estimated_time_unit: Joi.string().valid(...Object.values(timeUnits)).optional(),
});
