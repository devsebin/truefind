import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";

/**
 * Defines validation and expected value rules for extracted document fields
 */
export interface IDocumentValidationRules {
    required?: boolean;
    pattern?: string;
    min_value?: number | Date;
    max_value?: number | Date;
    allowed_values?: string[];
    must_match_field?: string;
}

/**
 * Hints for OCR or AI-based data extraction
 */
export interface IDocumentExtractionHint {
    page_number?: number;
    region_hint?: string;
    keyword_anchor?: string;
}

/**
 * OCR model configuration for mapping extracted data
 */
export interface IOCRMapping {
    model_key?: string;
    confidence_threshold?: number;
}

/**
 * Describes each required data field inside a document
 */
export interface IDocumentDataRequirement {
    field_name: string;
    display_label?: string;
    data_type: "string" | "number" | "date" | "boolean";
    validation_rules?: IDocumentValidationRules;
    expected_value?: string | number | boolean | Date;
    extraction_hint?: IDocumentExtractionHint;
    ocr_mapping?: IOCRMapping;
}

/**
 * Main Task Document Requirement model
 */
export interface IServiceDocumentRequirements extends CommonServiceFieldsInterface {
    name: string;
    display_name: string;
    item_code: string;
    document_type_id: Types.ObjectId;
    description?: string;
    max_file_size: number; // MB
    accepted_mimeTypes: string[];
    samples?: Types.ObjectId[] | null;
    data_requirements?: IDocumentDataRequirement[];
}
