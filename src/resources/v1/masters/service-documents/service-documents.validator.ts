import { IServiceDocumentRequirements } from "@/database/service-documents/service-documents-db-interface";
import { objectIdValidator } from "@/utils/responses/error.response";
import Joi from "joi";

const DocumentValidationRulesValidator = Joi.object({
    required: Joi.boolean().optional(),
    pattern: Joi.string().allow("", null).optional(),
    min_value: Joi.alternatives().try(Joi.number(), Joi.date()).optional(),
    max_value: Joi.alternatives().try(Joi.number(), Joi.date()).optional(),
    allowed_values: Joi.array().items(Joi.string()).optional(),
    must_match_field: Joi.string().allow("", null).optional(),
});

const DocumentExtractionHintValidator = Joi.object({
    page_number: Joi.number().optional(),
    region_hint: Joi.string().allow("", null).optional(),
    keyword_anchor: Joi.string().allow("", null).optional(),
});

const OCRMappingValidator = Joi.object({
    model_key: Joi.string().allow("", null).optional(),
    confidence_threshold: Joi.number().min(0).max(1).optional(),
});

const DocumentDataRequirementValidator = Joi.object({
    field_name: Joi.string().trim().required(),
    display_label: Joi.string().allow("", null).optional(),
    data_type: Joi.string().valid("string", "number", "date", "boolean").required(),
    validation_rules: DocumentValidationRulesValidator.optional(),
    expected_value: Joi.any().optional(),
    extraction_hint: DocumentExtractionHintValidator.optional(),
    ocr_mapping: OCRMappingValidator.optional(),
});

export const serviceDocumentInputValidator = Joi.object<IServiceDocumentRequirements>({
    name: Joi.string().trim().min(2).max(255).required(),
    display_name: Joi.string().trim().min(2).max(255).required(),
    item_code: Joi.string().trim().min(2).max(255).required(),
    document_type_id: Joi.string().custom(objectIdValidator).required(),
    description: Joi.string().allow("", null).optional(),
    max_file_size: Joi.number().min(1).max(100).required(),
    accepted_mimeTypes: Joi.array().items(Joi.string()).min(1).required(),
    samples: Joi.array().items(Joi.string().custom(objectIdValidator)).allow(null).optional(),
    data_requirements: Joi.array().items(DocumentDataRequirementValidator).optional(),
    status_id: Joi.string().custom(objectIdValidator).optional(),
});

export const updateServiceDocumentInputValidator = Joi.object<IServiceDocumentRequirements>({
    name: Joi.string().trim().min(2).max(255).optional(),
    display_name: Joi.string().trim().min(2).max(255).optional(),
    item_code: Joi.string().trim().min(2).max(255).optional(),
    document_type_id: Joi.string().custom(objectIdValidator).optional(),
    description: Joi.string().allow("", null).optional(),
    max_file_size: Joi.number().min(1).max(100).optional(),
    accepted_mimeTypes: Joi.array().items(Joi.string()).min(1).optional(),
    samples: Joi.array().items(Joi.string().custom(objectIdValidator)).allow(null).optional(),
    data_requirements: Joi.array().items(DocumentDataRequirementValidator).optional(),
    status_id: Joi.string().custom(objectIdValidator).optional(),
});

export const deleteServiceDocumentInputValidator = Joi.object({
    force_action: Joi.boolean().optional(),
});
