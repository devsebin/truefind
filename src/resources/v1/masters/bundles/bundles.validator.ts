import { IBundleDocument } from "@/database/bundles/bundles-db-interface";
import { objectIdValidator } from "@/utils/responses/error.response";
import Joi from "joi";

export const bundlesInputValidator = Joi.object<IBundleDocument>({
  name: Joi.string().trim().min(2).max(255).required(),
  display_name: Joi.string().trim().min(2).max(255).required(),
  code: Joi.string().trim().uppercase().min(2).max(100).required(),
  description: Joi.string().trim().allow("").optional(),
  icon: Joi.custom(objectIdValidator, "Invalid ObjectId").required(),
  sort_order: Joi.number().integer().optional().default(0),
  tags: Joi.array().items(Joi.string().trim()).optional().default([]),
  metadata: Joi.object().optional().default({}),
});

export const updateBundlesInputValidator = Joi.object<IBundleDocument>({
  name: Joi.string().trim().min(2).max(255).optional(),
  display_name: Joi.string().trim().min(2).max(255).optional(),
  code: Joi.string().trim().uppercase().min(2).max(100).optional(),
  description: Joi.string().trim().allow("").optional(),
  icon: Joi.custom(objectIdValidator, "Invalid ObjectId").required(),
  sort_order: Joi.number().integer().optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  metadata: Joi.object().optional(),
});

export const deleteBundlesInputValidator = Joi.object({
  force_action: Joi.boolean().optional(),
});
