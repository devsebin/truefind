import { timeUnits } from "@/database/services/services-db-interface";

export interface IInputIServiceCountryConfigurationPayload {
  service_id: string;
  country_id: string;
  required_licenses: boolean;
  is_callout_service: boolean;
  is_fixed_price: boolean;
  currency_id: string;
  price?: number;
  unit_id: string;
  minimum_unit_price?: number;
  maximum_unit_price?: number;
  call_out_fee?: number;
  estimated_time?: number;
  estimated_time_unit?: timeUnits;
  is_active?: boolean;
}

export interface IInputIServiceCountryConfigurationPayloadStrict
  extends IInputIServiceCountryConfigurationPayload {}
