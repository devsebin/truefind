import mongoose, { Schema, Types, model } from "mongoose";
import { IStatus } from "./status-db-interface";
import { tableName } from "../../utils/definitions/constants/table-names";

const StatusSchema = new Schema<IStatus>(
  {
    title: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    is_default: {
      type: Boolean,
      required: false,
      default: false,
    },
    is_active: {
      type: Boolean,
      required: true,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      required: true,
      default: false,
    },
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
    deleted_at: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  },
);

StatusSchema.methods.toJSON = function () {
  const statusObject = this.toObject();
  delete statusObject.__v;
  return statusObject;
};

StatusSchema.index({ title: 1 });
StatusSchema.index(
  { is_default: 1 },
  {
    unique: true,
    partialFilterExpression: {
      is_default: true,
      is_active: true,
    },
    name: "unique_active_default_status",
  },
);

const StatusModel = model<IStatus>(tableName.Status, StatusSchema);

export default StatusModel;
