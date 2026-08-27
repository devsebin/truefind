import { IBundleLocationConfigStatus } from "@/database/bundle-location-config-status/bundle-location-config-status-db-interface";
import Joi from "joi";

export const bundleLocationConfigStatusesInputValidator =
  Joi.object<IBundleLocationConfigStatus>({
    title: Joi.string().trim().min(3).max(255).required(),
    label: Joi.string().trim().required(),
    color: Joi.string().trim().required(),
    is_default: Joi.boolean().optional().default(false),
  });

export const updateBundleLocationConfigStatusesInputValidator =
  Joi.object<IBundleLocationConfigStatus>({
    title: Joi.string().trim().min(3).max(255).optional(),
    label: Joi.string().trim().optional(),
    color: Joi.string().trim().optional(),
    is_default: Joi.boolean().optional(),
  });

export const deleteBundleLocationConfigStatusesInputValidator = Joi.object({
  force_action: Joi.boolean().optional(),
});
