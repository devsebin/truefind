import mongoose from "mongoose";
import { timeUnits } from "@/database/services/services-db-interface";

export interface IServiceCountryConfigurationDTO {
  service_id: mongoose.Types.ObjectId;
  country_id: mongoose.Types.ObjectId;
  required_licenses: boolean;
  is_callout_service: boolean;
  is_fixed_price: boolean;
  currency_id: mongoose.Types.ObjectId;
  price?: number;
  unit_id: mongoose.Types.ObjectId;
  minimum_unit_price?: number;
  maximum_unit_price?: number;
  call_out_fee?: number;
  estimated_time?: number;
  estimated_time_unit?: timeUnits;
  is_active?: boolean;
}

export function toServiceCountryConfigurationDTO(
  body: any
): IServiceCountryConfigurationDTO {
  return {
    service_id: new mongoose.Types.ObjectId(body.service_id),
    country_id: new mongoose.Types.ObjectId(body.country_id),
    required_licenses: body.required_licenses ?? false,
    is_callout_service: body.is_callout_service ?? false,
    is_fixed_price: body.is_fixed_price ?? false,
    currency_id: new mongoose.Types.ObjectId(body.currency_id),
    price: body.price !== undefined ? Number(body.price) : undefined,
    unit_id: new mongoose.Types.ObjectId(body.unit_id),
    minimum_unit_price: body.minimum_unit_price !== undefined ? Number(body.minimum_unit_price) : undefined,
    maximum_unit_price: body.maximum_unit_price !== undefined ? Number(body.maximum_unit_price) : undefined,
    call_out_fee: body.call_out_fee !== undefined ? Number(body.call_out_fee) : undefined,
    estimated_time: body.estimated_time !== undefined ? Number(body.estimated_time) : undefined,
    estimated_time_unit: body.estimated_time_unit || undefined,
    is_active: body.is_active ?? undefined,
  };
}
