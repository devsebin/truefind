import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Document, Types } from "mongoose";
import { timeUnits } from "../services/services-db-interface";

export interface IServiceCountryConfigurationDocument extends CommonServiceFieldsInterface, Document {
    service_id: Types.ObjectId;
    country_id: Types.ObjectId;

    required_licenses: boolean;

    is_callout_service: boolean;
    is_fixed_price: boolean;

    currency_id: Types.ObjectId;

    price?: number;
    unit_id: Types.ObjectId;

    minimum_unit_price?: number;
    maximum_unit_price?: number;

    call_out_fee?: number;

    estimated_time?: number;
    estimated_time_unit?: timeUnits;
}
