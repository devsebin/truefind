import { IBundleUserMappingStatus } from "@/database/bundle-user-mapping-status/bundle-user-mapping-status-db-interface";
import Joi from "joi";

export const bundleUserMappingStatusInputValidator = Joi.object<IBundleUserMappingStatus>({
  title: Joi.string().trim().min(3).max(255).required(),
  label: Joi.string().trim().required(),
  color: Joi.string().trim().required(),
  is_default: Joi.boolean().optional().default(false),
});

export const updateBundleUserMappingStatusInputValidator = Joi.object<IBundleUserMappingStatus>({
  title: Joi.string().trim().min(3).max(255).optional(),
  label: Joi.string().trim().optional(),
  color: Joi.string().trim().optional(),
  is_default: Joi.boolean().optional(),
});

export const deleteBundleUserMappingStatusInputValidator = Joi.object({
  force_action: Joi.boolean().optional(),
});
