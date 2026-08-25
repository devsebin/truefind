import mongoose from "mongoose";
import { timeUnits } from "@/database/services/services-db-interface";

export interface IServiceAreaOverrideDTO {
  required_licenses?: boolean;
  is_callout_service?: boolean;
  is_fixed_price?: boolean;
  price?: number;
  unit_id?: mongoose.Types.ObjectId;
  minimum_unit_price?: number;
  maximum_unit_price?: number;
  call_out_fee?: number;
  estimated_time?: number;
  estimated_time_unit?: timeUnits;
  is_active?: boolean;
}

export interface IServiceAreaBulkOverrideDTO {
  service_id: mongoose.Types.ObjectId;
  suburb_ids: mongoose.Types.ObjectId[];
  overrides: IServiceAreaOverrideDTO;
}

export function toServiceAreaBulkOverrideDTO(
  serviceId: any,
  body: any
): IServiceAreaBulkOverrideDTO {
  const overrides = body.overrides || {};
  return {
    service_id: new mongoose.Types.ObjectId(serviceId),
    suburb_ids: (body.suburb_ids || []).map((id: string) => new mongoose.Types.ObjectId(id)),
    overrides: {
      required_licenses: overrides.required_licenses !== undefined ? !!overrides.required_licenses : undefined,
      is_callout_service: overrides.is_callout_service !== undefined ? !!overrides.is_callout_service : undefined,
      is_fixed_price: overrides.is_fixed_price !== undefined ? !!overrides.is_fixed_price : undefined,
      price: overrides.price !== undefined ? Number(overrides.price) : undefined,
      unit_id: overrides.unit_id ? new mongoose.Types.ObjectId(overrides.unit_id) : undefined,
      minimum_unit_price: overrides.minimum_unit_price !== undefined ? Number(overrides.minimum_unit_price) : undefined,
      maximum_unit_price: overrides.maximum_unit_price !== undefined ? Number(overrides.maximum_unit_price) : undefined,
      call_out_fee: overrides.call_out_fee !== undefined ? Number(overrides.call_out_fee) : undefined,
      estimated_time: overrides.estimated_time !== undefined ? Number(overrides.estimated_time) : undefined,
      estimated_time_unit: overrides.estimated_time_unit || undefined,
      is_active: overrides.is_active !== undefined ? !!overrides.is_active : undefined,
    },
  };
}
