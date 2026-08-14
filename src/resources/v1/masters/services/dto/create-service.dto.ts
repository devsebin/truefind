import { timeUnits } from "@/database/services/services-db-interface";
import mongoose from "mongoose";

export interface IServiceDTO {
  parent_id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  icon: mongoose.Types.ObjectId;
  task_unit?: mongoose.Types.ObjectId | null;
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
    task_unit: body.task_unit ? new mongoose.Types.ObjectId(body.task_unit) : null,
    estimated_time: body.estimated_time ?? 0,
    estimated_time_unit: body.estimated_time_unit || timeUnits.hours,
    priority_id: body.priority_id ? new mongoose.Types.ObjectId(body.priority_id) : null,
  };
}
