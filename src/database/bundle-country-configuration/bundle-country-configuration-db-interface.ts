import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Document, Types } from "mongoose";
import { timeUnits } from "../services/services-db-interface";

export type BundleDiscountType =
    | "FIXED"
    | "PERCENTAGE"
    | "NONE";

export interface IBundleCountryConfigurationDocument
    extends CommonServiceFieldsInterface,
    Document {
    bundle_id: Types.ObjectId;
    country_id: Types.ObjectId;
    is_active: boolean;
    is_callout_bundle: boolean;
    is_fixed_price: boolean;
    currency_id: Types.ObjectId;
    price?: number;
    unit_id?: Types.ObjectId;
    minimum_price?: number;
    maximum_price?: number;
    call_out_fee?: number;
    estimated_time?: number;
    estimated_time_unit?: timeUnits;
    individual_services_total?: number;
    bundle_discount_type?: BundleDiscountType;
    bundle_discount_value?: number;
    status_id: Types.ObjectId;
    metadata?: Record<string, unknown>;
}
