import Joi from "joi";
import { objectIdValidator } from "@/utils/responses/error.response";

const exemptionDocumentSchema = Joi.object({
  document_id: Joi.string()
    .custom(objectIdValidator)
    .required()
    .messages({
      "any.required": "exemption_documents.document_id is required",
      "string.custom": "exemption_documents.document_id must be a valid MongoDB ObjectId",
    }),
  condition: Joi.string()
    .valid("valid", "uploaded")
    .default("valid")
    .optional(),
});

const requiredDocumentItemSchema = Joi.object({
  document_id: Joi.string()
    .custom(objectIdValidator)
    .required()
    .messages({
      "any.required": "required_documents.document_id is required",
      "string.custom": "required_documents.document_id must be a valid MongoDB ObjectId",
    }),
  is_mandatory: Joi.boolean().default(true).optional(),
  exemption_documents: Joi.array()
    .items(exemptionDocumentSchema)
    .optional()
    .default([]),
});

export const serviceDocumentConfigCreateSchema = Joi.object({
  service_id: Joi.string()
    .custom(objectIdValidator)
    .required()
    .messages({
      "any.required": "service_id is required",
      "string.custom": "service_id must be a valid MongoDB ObjectId",
    }),
  required_documents: Joi.array()
    .items(requiredDocumentItemSchema)
    .min(1)
    .required()
    .messages({
      "any.required": "required_documents is required",
      "array.min": "At least one required document must be specified",
    }),
});

export const serviceDocumentConfigUpdateSchema = Joi.object({
  required_documents: Joi.array()
    .items(requiredDocumentItemSchema)
    .min(1)
    .required()
    .messages({
      "any.required": "required_documents is required",
      "array.min": "At least one required document must be specified",
    }),
});
