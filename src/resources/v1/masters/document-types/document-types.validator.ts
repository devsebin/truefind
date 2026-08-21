import IDocumentType from "@/database/document-types/document-types-db-interface";
import Joi from "joi";

export const documentTypesInputValidator = Joi.object<IDocumentType>({
    title: Joi.string().trim().min(3).max(255).required(),
    label: Joi.string().trim().required(),
    color: Joi.string().trim().required(),
    is_default: Joi.boolean().optional().default(false),
});

export const updateDocumentTypesInputValidator = Joi.object<IDocumentType>({
    title: Joi.string().trim().min(3).max(255).optional(),
    label: Joi.string().trim().optional(),
    color: Joi.string().trim().optional(),
    is_default: Joi.boolean().optional(),
});

export const deleteDocumentTypesInputValidator = Joi.object({
    force_action: Joi.boolean().optional(),
});
