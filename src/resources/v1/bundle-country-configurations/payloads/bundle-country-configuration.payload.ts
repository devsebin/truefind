import { BundleDiscountType } from "@/database/bundle-country-configuration/bundle-country-configuration-db-interface";
import { timeUnits } from "@/database/services/services-db-interface";

export interface IInputIBundleCountryConfigurationPayload {
  bundle_id: string;
  country_id: string;
  currency_id: string;
  unit_id?: string;
  is_callout_bundle: boolean;
  is_fixed_price: boolean;
  price?: number;
  minimum_price?: number;
  maximum_price?: number;
  call_out_fee?: number;
  estimated_time?: number;
  estimated_time_unit?: timeUnits;
  individual_services_total?: number;
  bundle_discount_type?: BundleDiscountType;
  bundle_discount_value?: number;
  is_active?: boolean;
}

export interface IInputIBundleCountryConfigurationPayloadStrict
  extends IInputIBundleCountryConfigurationPayload {}
