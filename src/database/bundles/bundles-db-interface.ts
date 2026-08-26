import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Document, Types } from "mongoose";

export interface IBundleDocument
    extends CommonServiceFieldsInterface,
    Document {
    name: string;
    display_name: string;
    code: string;
    description?: string;
    icon: Types.ObjectId;
    status_id: Types.ObjectId;
    is_active: boolean;
    is_deleted: boolean;
    sort_order?: number;
    tags?: string[];
    metadata?: Record<string, unknown>;
}
