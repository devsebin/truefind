import Joi from "joi";
import { objectIdValidator } from "@/utils/responses/error.response";
import { ServiceUserDocumentConfigurationStatus } from "@/database/service-user-document-configuration/service-user-document-configuration-db-model";

const allowedStatuses = Object.values(ServiceUserDocumentConfigurationStatus);

export const createServiceUserDocConfigValidator = Joi.object({
  user_id: Joi.string()
    .custom(objectIdValidator)
    .optional()
    .messages({
      "string.custom": "user_id must be a valid MongoDB ObjectId",
    }),
  service_id: Joi.string()
    .custom(objectIdValidator)
    .required()
    .messages({
      "any.required": "service_id is required",
      "string.custom": "service_id must be a valid MongoDB ObjectId",
    }),
  document_requirement_id: Joi.string()
    .custom(objectIdValidator)
    .required()
    .messages({
      "any.required": "document_requirement_id is required",
      "string.custom": "document_requirement_id must be a valid MongoDB ObjectId",
    }),
  is_mandatory: Joi.boolean().optional(),
  current_status: Joi.string()
    .valid(...allowedStatuses)
    .optional()
    .messages({
      "any.only": `current_status must be one of [${allowedStatuses.join(", ")}]`,
    }),
});

export const updateServiceUserDocConfigValidator = Joi.object({
  is_mandatory: Joi.boolean().optional(),
  current_status: Joi.string()
    .valid(...allowedStatuses)
    .optional()
    .messages({
      "any.only": `current_status must be one of [${allowedStatuses.join(", ")}]`,
    }),
  is_active: Joi.boolean().optional(),
});

export const uploadServiceUserDocValidator = Joi.object({
  document_id: Joi.string()
    .custom(objectIdValidator)
    .required()
    .messages({
      "any.required": "document_id is required",
      "string.custom": "document_id must be a valid MongoDB ObjectId",
    }),
});

export const approveServiceUserDocValidator = Joi.object({
  validation_notes: Joi.string().trim().optional().allow(""),
});

export const rejectServiceUserDocValidator = Joi.object({
  reason: Joi.string()
    .trim()
    .min(1)
    .required()
    .messages({
      "any.required": "reason is required",
      "string.empty": "reason cannot be empty",
      "string.min": "reason cannot be empty",
    }),
});

export const deleteServiceUserDocConfigValidator = Joi.object({
  force_action: Joi.boolean().optional(),
});
