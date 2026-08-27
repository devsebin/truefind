import Joi from "joi";
import { objectIdValidator } from "@/utils/responses/error.response";

export const bundleServiceItemCreateSchema = Joi.object({
  bundle_id: Joi.string()
    .required()
    .custom(objectIdValidator)
    .messages({
      "any.required": "bundle_id is required",
      "string.custom": "bundle_id must be a valid MongoDB ObjectId",
    }),

  service_id: Joi.string()
    .required()
    .custom(objectIdValidator)
    .messages({
      "any.required": "service_id is required",
      "string.custom": "service_id must be a valid MongoDB ObjectId",
    }),

  sort_order: Joi.number().optional().default(0),

  quantity: Joi.number().optional().min(1).default(1),

  is_mandatory: Joi.boolean().optional().default(true),

  is_included: Joi.boolean().optional().default(true),

  service_name_snapshot: Joi.string().optional().allow(""),

  service_code_snapshot: Joi.string().optional().allow(""),

  metadata: Joi.object().optional(),

  is_active: Joi.boolean().optional(),
});

export const bundleServiceItemUpdateSchema = Joi.object({
  bundle_id: Joi.string()
    .optional()
    .custom(objectIdValidator)
    .messages({
      "string.custom": "bundle_id must be a valid MongoDB ObjectId",
    }),

  service_id: Joi.string()
    .optional()
    .custom(objectIdValidator)
    .messages({
      "string.custom": "service_id must be a valid MongoDB ObjectId",
    }),

  sort_order: Joi.number().optional(),

  quantity: Joi.number().optional().min(1),

  is_mandatory: Joi.boolean().optional(),

  is_included: Joi.boolean().optional(),

  service_name_snapshot: Joi.string().optional().allow(""),

  service_code_snapshot: Joi.string().optional().allow(""),

  metadata: Joi.object().optional(),

  is_active: Joi.boolean().optional(),
});

export const bundleServiceItemToggleStatusSchema = Joi.object({
  is_active: Joi.boolean().required().messages({
    "any.required": "is_active is required",
  }),
});
