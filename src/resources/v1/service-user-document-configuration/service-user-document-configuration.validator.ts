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

export const deleteServiceUserDocConfigValidator = Joi.object({
  force_action: Joi.boolean().optional(),
});
