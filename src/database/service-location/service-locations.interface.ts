import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Document, Types } from "mongoose";

export interface IServiceLocations extends CommonServiceFieldsInterface {
  service_id: Types.ObjectId;
  country_id: Types.ObjectId;
  region_id: Types.ObjectId;
  district_id: Types.ObjectId;
  currency: String; // from country document
  requiredLicenses: Boolean;
  is_callout_service: Boolean;
  call_out_fee: Number;
  estimated_time: Number;
  estimated_time_unit: String; // Minutes or Hours
  is_fixed_price: Boolean;
  fixed_price: Number;
  charging_unit: Types.ObjectId; // unit id from service like Square Meters, Linear Meters
  charging_unit_price: Number; // Price per unit
  maximum_charging_unit_price: Number; // Maximum price per unit
  minimum_charging_unit_price: Number; // Minimum price per unit
  priority_id?: Types.ObjectId | null;
  task_unit?: Types.ObjectId | null;
  task_unit_price?: number;
  maximum_unit_price?: number;
  minimum_unit_price?: number;
}
