import mongoose, { Schema, model } from "mongoose";
import { IPriorities } from "./priority-db-interface";
import { CommonServiceFieldsModel } from "../../utils/definitions/constants/db-constants";
import { tableName } from "../../utils/definitions/constants/table-names";
import { defaultStatusPlugin } from "../../utils/plugins/defaultStatus.plugin";

const PrioritySchema = new Schema<IPriorities>(
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
    description: {
      type: String,
    },
    is_default: {
      type: Boolean,
      default: false,
    },
    ...CommonServiceFieldsModel,
  },
  {
    timestamps: true,
  },
);

PrioritySchema.index(
  { is_default: 1 },
  {
    unique: true,
    partialFilterExpression: { is_default: true },
  },
);

// Add default status_id if not present
PrioritySchema.plugin(defaultStatusPlugin);

// Remove __v in response
PrioritySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Strongly-typed model
const PriorityModel = model<IPriorities>(tableName.Priority, PrioritySchema);

export default PriorityModel;
