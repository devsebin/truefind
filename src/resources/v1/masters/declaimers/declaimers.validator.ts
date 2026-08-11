import { objectIdValidator } from "@/utils/responses/error.response";
import Joi from "joi";

export enum declaimerKeys {
  TERMS_OF_SERVICE = "terms_of_service",
  TERMS_AND_CONDITIONS = "terms_and_conditions",
  PRIVACY_POLICY = "privacy_policy",
  ABOUT_US = "about_us",
  CONTACT_US = "contact_us",
  FAQ = "faq",
  DISCLAIMER = "disclaimer",
}

/* ------------------ Create Declaimer ------------------ */
export const declaimerInputValidator = Joi.object({
  key: Joi.string()
    .trim()
    .lowercase()
    .required()
    .valid(...Object.values(declaimerKeys))
    .messages({
      "any.required": "Key is required",
    }),
  title: Joi.string().trim().required(),
  content: Joi.string().trim().required(),
  language: Joi.string().length(2).lowercase().default("en"),
  country: Joi.custom(objectIdValidator).required(),
  metadata: Joi.object().optional(),

  published_at: Joi.forbidden(),
  created_by: Joi.forbidden(),
  version: Joi.forbidden(),
  created_at: Joi.forbidden(),
  updated_at: Joi.forbidden(),
  deleted_at: Joi.date().forbidden(),
  is_deleted: Joi.boolean().forbidden().default(false),
  updated_by: Joi.string().forbidden(),
  deleted_by: Joi.string().forbidden(),
  status_id: Joi.forbidden(),
  is_active: Joi.boolean().forbidden().default(true),
});

/* ------------------ Update Declaimer ------------------ */
export const updateDeclaimerInputValidator = Joi.object({
  title: Joi.string().trim().optional(),
  content: Joi.string().trim().optional(),
  metadata: Joi.object().optional(),

  language: Joi.forbidden(),
  country: Joi.forbidden(),
  published_at: Joi.forbidden(),
  created_by: Joi.forbidden(),
  version: Joi.forbidden(),
  created_at: Joi.forbidden(),
  updated_at: Joi.forbidden(),
  deleted_at: Joi.date().forbidden(),
  is_deleted: Joi.boolean().forbidden().default(false),
  updated_by: Joi.string().forbidden(),
  deleted_by: Joi.string().forbidden(),
  status_id: Joi.forbidden(),
  is_active: Joi.boolean().forbidden().default(true),
});

/* ------------------ Delete Declaimer ------------------ */
export const deleteDeclaimerInputValidator = Joi.object({
  force_action: Joi.boolean().optional(),
});
