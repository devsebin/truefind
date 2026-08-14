import Joi from "joi";
import { objectIdValidator } from "@/utils/responses/error.response";

export const currenciesValidationSchema = Joi.object({
  title: Joi.string().required().min(2).max(100),
  label: Joi.string().required().min(1).max(50),
  code: Joi.string().required().length(3),
  symbol: Joi.string().required().custom(objectIdValidator).messages({
    "any.required": "symbol is required",
    "string.custom": "symbol must be a valid MongoDB ObjectId",
  }),
});

export const currenciesUpdateValidationSchema = Joi.object({
  title: Joi.string().optional().min(2).max(100),
  label: Joi.string().optional().min(1).max(50),
  code: Joi.string().optional().length(3),
  symbol: Joi.string().optional().custom(objectIdValidator),
});

export const deleteCurrencyInputValidator = Joi.object({
  force: Joi.boolean().optional(),
  force_action: Joi.boolean().optional(),
});
