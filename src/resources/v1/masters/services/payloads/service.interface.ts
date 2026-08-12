import mongoose, { Types } from "mongoose";

enum timeUnits {
  minutes = "minutes",
  hours = "hours",
  days = "days",
  weeks = "weeks",
  months = "months",
  years = "years",
}
export interface IServicePayload {
  parent_id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  icon: Types.ObjectId;
  requiredLicenses: boolean;
  is_callout_service: boolean;
  is_fixed_price: boolean;
  task_unit: Types.ObjectId;
  task_unit_price: number;
  maximum_unit_price: number;
  minimum_unit_price: number;
  estimated_time: number;
  estimated_time_unit: timeUnits;
  priority_id: Types.ObjectId;
}
