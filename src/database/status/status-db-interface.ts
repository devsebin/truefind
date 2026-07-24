import { Types } from "mongoose";

export interface IStatus {
  title: string;
  label: string;
  color: string;
  is_default?: boolean;
  is_active: boolean;
  is_deleted: boolean;
  deleted_at?: Date;
  created_by: Types.ObjectId;
  updated_by?: Types.ObjectId;
  deleted_by?: Types.ObjectId;
}
