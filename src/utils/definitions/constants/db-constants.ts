import mongoose from "mongoose";
import { tableName } from "./table-names";

export const CommonServiceFieldsModel = {
  is_active: { type: Boolean, default: true, index: true },
  is_verified: { type: Boolean, default: false, index: true },
  is_approved: { type: Boolean, default: false, index: true },
  is_test: { type: Boolean, default: false, index: true },
  is_deleted: { type: Boolean, default: false, index: true },
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
  is_verified: boolean;
  is_approved: boolean;
  is_test: boolean;
  is_deleted: boolean;
  deleted_at?: Date;
  created_by: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  deleted_by?: mongoose.Types.ObjectId;
  status_id: mongoose.Types.ObjectId;
}
