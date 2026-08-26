import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Document, Types } from "mongoose";

export interface IBundleServiceItem
    extends CommonServiceFieldsInterface,
        Document {
    bundle_id: Types.ObjectId;
    service_id: Types.ObjectId;
    sort_order: number;
    quantity?: number;
    is_mandatory: boolean;
    is_included: boolean;
    service_name_snapshot?: string;
    service_code_snapshot?: string;
    metadata?: Record<string, unknown>;
}
