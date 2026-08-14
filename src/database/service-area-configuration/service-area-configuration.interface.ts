import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Document, Types } from "mongoose";
import { timeUnits } from "../services/services-db-interface";

export interface IServiceAreaConfigurationDocument extends CommonServiceFieldsInterface, Document {
    service_id: Types.ObjectId;
    suburb_id: Types.ObjectId;

    required_licenses?: boolean;

    is_callout_service?: boolean;
    is_fixed_price?: boolean;

    price?: number;
    unit_id?: Types.ObjectId;

    minimum_unit_price?: number;
    maximum_unit_price?: number;

    call_out_fee?: number;

    estimated_time?: number;
    estimated_time_unit?: timeUnits;
}
