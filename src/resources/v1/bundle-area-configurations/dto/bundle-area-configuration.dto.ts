import mongoose from "mongoose";
import { BundleDiscountType } from "@/database/bundle-country-configuration/bundle-country-configuration-db-interface";
import { timeUnits } from "@/database/services/services-db-interface";

export interface ICreateBundleAreaConfigurationDTO {
  country_configuration_id: mongoose.Types.ObjectId;
  suburb_ids: mongoose.Types.ObjectId[];
}

export function toCreateBundleAreaConfigurationDTO(
  body: any,
): ICreateBundleAreaConfigurationDTO {
  return {
    country_configuration_id: new mongoose.Types.ObjectId(
      body.country_configuration_id,
    ),
    suburb_ids: Array.isArray(body.suburb_ids)
      ? body.suburb_ids.map((id: string) => new mongoose.Types.ObjectId(id))
      : [],
  };
}

export interface IUpdateBundleAreaConfigurationDTO {
  is_callout_bundle?: boolean;
  is_fixed_price?: boolean;
  price?: number;
  unit_id?: mongoose.Types.ObjectId;
  currency_id?: mongoose.Types.ObjectId;
  minimum_price?: number;
  maximum_price?: number;
  call_out_fee?: number;
  estimated_time?: number;
  estimated_time_unit?: timeUnits;
  individual_services_total?: number;
  bundle_discount_type?: BundleDiscountType;
  bundle_discount_value?: number;
  is_active?: boolean;
  status_id?: mongoose.Types.ObjectId;
}

export function toUpdateBundleAreaConfigurationDTO(
  body: any,
): IUpdateBundleAreaConfigurationDTO {
  return {
    is_callout_bundle: body.is_callout_bundle ?? undefined,
    is_fixed_price: body.is_fixed_price ?? undefined,
    price: body.price !== undefined ? Number(body.price) : undefined,
    unit_id: body.unit_id ? new mongoose.Types.ObjectId(body.unit_id) : undefined,
    currency_id: body.currency_id
      ? new mongoose.Types.ObjectId(body.currency_id)
      : undefined,
    minimum_price:
      body.minimum_price !== undefined ? Number(body.minimum_price) : undefined,
    maximum_price:
      body.maximum_price !== undefined ? Number(body.maximum_price) : undefined,
    call_out_fee:
      body.call_out_fee !== undefined ? Number(body.call_out_fee) : undefined,
    estimated_time:
      body.estimated_time !== undefined
        ? Number(body.estimated_time)
        : undefined,
    estimated_time_unit: body.estimated_time_unit || undefined,
    individual_services_total:
      body.individual_services_total !== undefined
        ? Number(body.individual_services_total)
        : undefined,
    bundle_discount_type: body.bundle_discount_type || undefined,
    bundle_discount_value:
      body.bundle_discount_value !== undefined
        ? Number(body.bundle_discount_value)
        : undefined,
    is_active: body.is_active ?? undefined,
    status_id: body.status_id
      ? new mongoose.Types.ObjectId(body.status_id)
      : undefined,
  };
}
