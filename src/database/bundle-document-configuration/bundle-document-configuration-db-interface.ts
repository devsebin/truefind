import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Document, Types } from "mongoose";

export interface IBundleRequiredDocument {
    document_id: Types.ObjectId;
    is_mandatory: boolean;
    source_service_ids: Types.ObjectId[];
    exemption_documents?: {
        document_id: Types.ObjectId;
        condition?: "valid" | "uploaded";
    }[];
    notes?: string;
}

export interface IBundleDocumentConfiguration
    extends CommonServiceFieldsInterface,
        Document {
    bundle_id: Types.ObjectId;
    required_documents: IBundleRequiredDocument[];
    version: number;
    is_active: boolean;
    metadata?: Record<string, unknown>;
}
