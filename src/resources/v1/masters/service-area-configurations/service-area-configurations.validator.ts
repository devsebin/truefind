import Joi from "joi";
import { objectIdValidator } from "@/utils/responses/error.response";
import { timeUnits } from "@/database/services/services-db-interface";

export const serviceAreaBulkOverrideSchema = Joi.object({
  suburb_ids: Joi.array().items(Joi.string().custom(objectIdValidator)).required().min(1).messages({
    "any.required": "suburb_ids is required",
    "array.min": "At least one suburb_id is required",
  }),
  overrides: Joi.object({
    required_licenses: Joi.boolean().optional(),
    is_callout_service: Joi.boolean().optional(),
    is_fixed_price: Joi.boolean().optional(),
    price: Joi.number().optional(),
    unit_id: Joi.string().custom(objectIdValidator).optional(),
    minimum_unit_price: Joi.number().optional(),
    maximum_unit_price: Joi.number().optional(),
    call_out_fee: Joi.number().optional(),
    estimated_time: Joi.number().optional(),
    estimated_time_unit: Joi.string().valid(...Object.values(timeUnits)).optional(),
    is_active: Joi.boolean().optional(),
  }).required().messages({
    "any.required": "overrides object is required",
  }),
});
