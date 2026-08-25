import mongoose from "mongoose";
import { tableName } from "./table-names";

export const CommonServiceFieldsModel = {
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  deleted_at: { type: Date, default: null },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: tableName.User,
    default: null,
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: tableName.User,
    default: null,
  },
  deleted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: tableName.User,
    default: null,
  },
};

export interface CommonServiceFieldsInterface {
  is_active: boolean;
  is_deleted: boolean;
  deleted_at?: Date;
  created_by: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  deleted_by?: mongoose.Types.ObjectId;
  status_id: mongoose.Types.ObjectId;
}
