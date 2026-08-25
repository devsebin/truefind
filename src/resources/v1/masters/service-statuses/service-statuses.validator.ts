import { IServiceStatus } from "@/database/service-status/service-status-db-interface";
import Joi from "joi";

export const serviceStatusesInputValidator = Joi.object<IServiceStatus>({
  title: Joi.string().trim().min(3).max(255).required(),
  label: Joi.string().trim().required(),
  color: Joi.string().trim().required(),
  is_default: Joi.boolean().optional().default(false),
});

export const updateServiceStatusesInputValidator = Joi.object<IServiceStatus>({
  title: Joi.string().trim().min(3).max(255).optional(),
  label: Joi.string().trim().optional(),
  color: Joi.string().trim().optional(),
  is_default: Joi.boolean().optional(),
});

export const deleteServiceStatusesInputValidator = Joi.object({
  force_action: Joi.boolean().optional(),
});
