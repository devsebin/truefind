import { timeUnits } from "@/database/services/services-db-interface";
import mongoose from "mongoose";

export interface IServiceDTO {
  parent_id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  icon: mongoose.Types.ObjectId;
  requiredLicenses?: boolean;
  is_callout_service?: boolean;
  is_fixed_price?: boolean;
  task_unit?: mongoose.Types.ObjectId | null;
  task_unit_price?: number;
  maximum_unit_price?: number;
  minimum_unit_price?: number;
  estimated_time?: number;
  estimated_time_unit?: timeUnits;
  priority_id?: mongoose.Types.ObjectId | null;
}

export function toServiceDTO(body: any): IServiceDTO {
  return {
    parent_id: new mongoose.Types.ObjectId(body.parent_id),
    name: body.name?.trim(),
    description: body.description?.trim() || "",
    icon: new mongoose.Types.ObjectId(body.icon),
    requiredLicenses: body.requiredLicenses ?? false,
    is_callout_service: body.is_callout_service ?? false,
    is_fixed_price: body.is_fixed_price ?? false,
    task_unit: body.task_unit ? new mongoose.Types.ObjectId(body.task_unit) : null,
    task_unit_price: body.task_unit_price ?? 0,
    maximum_unit_price: body.maximum_unit_price ?? 0,
    minimum_unit_price: body.minimum_unit_price ?? 0,
    estimated_time: body.estimated_time ?? 0,
    estimated_time_unit: body.estimated_time_unit || timeUnits.hours,
    priority_id: body.priority_id ? new mongoose.Types.ObjectId(body.priority_id) : null,
  };
}
