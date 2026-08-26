import { model, Schema } from "mongoose";

import { activityTypes } from "@/utils/definitions/constants/activity-types";
import { tableName } from "@/utils/definitions/constants/table-names";
import { datatypes } from "@/utils/definitions/constants/data-types";
import { FormFieldType } from "@/utils/interfaces/api.interface";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import {
  IApi,
  IDataSource,
  IFormOption,
  IFormParams,
  ISearchParams,
} from "./apis-db-interface";

const paramsSchema: Schema = new Schema<ISearchParams>(
  {
    title: { type: String, required: true },
    value: { type: String, required: true },
    allowed_values: { type: [String], required: true },
    datatype: { type: String, required: true },
    search_type: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    is_required: { type: Boolean, default: false },
    admin_access: { type: Boolean, default: true },
    user_access: { type: Boolean, default: true },
    employee_access: { type: Boolean, default: true },
  },
  { _id: false },
);

const inputSchema: Schema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
    type: { type: String, required: true },
    required: { type: Boolean, default: false },
    parent: { type: Boolean, required: false },
    parent_key: { type: String, required: false, default: null },
  },
  { _id: false },
);

const accessRuleSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ["all", "field", "scoped"],
      required: true,
    },

    keys: {
      type: [String],
      default: [],
    },

    custom: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const accessParamsSchema: Schema = new Schema(
  {
    admin_access: { type: accessRuleSchema, default: null },
    user_access: { type: accessRuleSchema, default: null },
    employee_access: { type: accessRuleSchema, default: null },
  },
  { _id: false },
);

const formOptionSchema = new Schema<IFormOption>(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false },
);

const dataSourceSchema = new Schema<IDataSource>(
  {
    api: {
      type: String,
      trim: true,
      required: true,
    },

    method: {
      type: String,
      trim: true,
      enum: apiMethods,
      default: "GET",
      required: false,
    },

    value_key: {
      type: String,
      trim: true,
    },

    label_key: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const validationSchema = new Schema(
  {
    min: {
      type: Number,
    },

    max: {
      type: Number,
    },

    minLength: {
      type: Number,
    },

    maxLength: {
      type: Number,
    },

    pattern: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const uiSchema = new Schema(
  {
    rows: {
      type: Number,
      default: 3,
    },

    grid: {
      type: Number,
      default: 12,
    },
  },
  { _id: false },
);

export const formParamsSchema = new Schema<IFormParams>(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    field_type: {
      type: String,
      enum: Object.values(FormFieldType),
      required: true,
    },

    datatype: {
      type: String,
      enum: Object.values(datatypes),
      required: true,
    },

    required: {
      type: Boolean,
      default: false,
    },

    placeholder: {
      type: String,
      trim: true,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    readonly: {
      type: Boolean,
      default: false,
    },

    hidden: {
      type: Boolean,
      default: false,
    },

    multiple: {
      type: Boolean,
      default: false,
    },

    default_value: {
      type: Schema.Types.Mixed,
    },

    options: {
      type: [formOptionSchema],
      default: [],
    },

    data_source: {
      type: dataSourceSchema,
      default: null,
    },

    validation: {
      type: validationSchema,
      default: {},
    },

    ui: {
      type: uiSchema,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);
const apiModelSchema: Schema = new Schema<IApi>(
  {
    activity_type: { type: String, enum: Object.values(activityTypes) },
    module: { type: String, required: true },
    required_authentication: { type: Boolean, default: true },
    activity_name: { type: String, required: true },
    activity_method: { type: String, required: true },
    activity_code: { type: String, required: true },
    payload_params: { type: [inputSchema] },
    form_params: { type: [formParamsSchema] },
    search_params: { type: [paramsSchema] },
    access_params: { type: accessParamsSchema, default: {} },
    access_roles: { type: [Schema.Types.ObjectId], ref: tableName.Roles, default: [] },
    url: { type: String, required: true },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  },
);

const api = model<IApi>(tableName.Api, apiModelSchema);

export { api, apiModelSchema };
