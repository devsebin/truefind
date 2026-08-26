import { IBundleStatus } from "@/database/bundle-statuses/bundle-statuses-db-interface";
import Joi from "joi";

export const bundleStatusesInputValidator = Joi.object<IBundleStatus>({
  title: Joi.string().trim().min(3).max(255).required(),
  label: Joi.string().trim().required(),
  color: Joi.string().trim().required(),
  is_default: Joi.boolean().optional().default(false),
});

export const updateBundleStatusesInputValidator = Joi.object<IBundleStatus>({
  title: Joi.string().trim().min(3).max(255).optional(),
  label: Joi.string().trim().optional(),
  color: Joi.string().trim().optional(),
  is_default: Joi.boolean().optional(),
});

export const deleteBundleStatusesInputValidator = Joi.object({
  force_action: Joi.boolean().optional(),
});
