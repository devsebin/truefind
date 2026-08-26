import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Document, Types } from "mongoose";
import { BundleDiscountType } from "../bundle-country-configuration/bundle-country-configuration-db-interface";
import { Type } from "@aws-sdk/client-s3";

export type UserBundleStatus =
    | "PENDING"
    | "DOCUMENTS_PENDING"
    | "DOCUMENTS_SUBMITTED"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "REJECTED"
    | "CANCELLED"
    | "ON_HOLD";

export interface IUserBundleMapping
    extends CommonServiceFieldsInterface,
    Document {
    user_id: Types.ObjectId;
    bundle_id: Types.ObjectId;
    country_id: Types.ObjectId;
    suburb_id: Types.ObjectId;
    bundle_country_configuration_id?: Types.ObjectId;
    bundle_area_configuration_id?: Types.ObjectId;
    status_id: Types.ObjectId;
    currency_id: Types.ObjectId;
    bundle_price_minor: number;
    individual_services_total_minor: number;
    discount_amount_minor: number;
    pricing_snapshot?: {
        bundle_price_minor: number;
        individual_services_total_minor: number;
        discount_amount_minor: number;
        discount_type?: BundleDiscountType;
        discount_value?: number;
        currency_id: Types.ObjectId;
    };
    services?: {
        service_id: Types.ObjectId;
        service_name: string;
        service_price_minor: number;
        quantity: number;
    }[];
    purchased_at?: Date;
    completed_at?: Date;
    cancelled_at?: Date;
}
