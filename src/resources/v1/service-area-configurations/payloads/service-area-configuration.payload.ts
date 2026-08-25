import { timeUnits } from "@/database/services/services-db-interface";

export interface IInputIServiceAreaOverride {
  required_licenses?: boolean;
  is_callout_service?: boolean;
  is_fixed_price?: boolean;
  task_unit_price?: number;
  minimum_unit_price?: number;
  maximum_unit_price?: number;
  call_out_fee?: number;
  estimated_time?: number;
  estimated_time_unit?: timeUnits;
  is_active?: boolean;
}

export interface IInputIServiceAreaBulkOverridePayload {
  suburb_ids: string[];
  overrides: IInputIServiceAreaOverride;
}

export interface IInputIServiceAreaBulkOverridePayloadStrict
  extends IInputIServiceAreaBulkOverridePayload {}
