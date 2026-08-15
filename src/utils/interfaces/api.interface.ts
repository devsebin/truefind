import mongoose from "mongoose";
import { datatypes } from "../definitions/constants/data-types";
import { moduleTypes } from "../definitions/constants/modules";
import { apiMethods } from "../definitions/constants/api-methods";
import {
  IControlParams,
  ISearchParams,
} from "@/database/apis/apis-db-interface";

export enum AccessType {
  ALL = "all",
  FIELD = "field",
  SCOPED = "scoped", // future use
}

export enum FormFieldType {
  TEXT = "text",
  TEXTAREA = "textarea",
  NUMBER = "number",
  EMAIL = "email",
  SELECT = "select",
  MULTISELECT = "multiselect",
  CHECKBOX = "checkbox",
  RADIO = "radio",
  SWITCH = "switch",
  DATE = "date",
  FILE = "file",
  IMAGE = "image",
}

export interface IDataSource {
  api: string;
  method?: apiMethods;
  label_key: string;
  value_key: string;
}

export interface IFormField<T = any> {
  key: keyof T;
  label: string;
  field_type: FormFieldType;
  datatype: datatypes;
  required: boolean;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  multiple?: boolean;
  default_value?: any;
  options?: {
    label: string;
    value: any;
  }[];

  data_source?: IDataSource;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;

    // file upload validation
    file?: {
      maxSizeMB?: number;
      minFiles?: number;
      maxFiles?: number;

      allowedTypes?: string[]; // MIME types
      allowedExtensions?: string[];

      image?: {
        minWidth?: number;
        minHeight?: number;
        maxWidth?: number;
        maxHeight?: number;
      };
    };
  };
  ui?: {
    rows?: number;
    grid?: number;
  };
}

export interface IAccessRule {
  type: AccessType;
  keys: string[];
  custom?: boolean;
}

interface inputParams<T> {
  key: keyof T;
  value: string;
  type: datatypes;
  required: boolean;
  parent: boolean;
  parent_key: string;
}

export interface IAccessParams {
  admin_access?: IAccessRule;
  user_access?: IAccessRule;
  employee_access?: IAccessRule;
}

export interface IAPI<T = any> {
  activity_type: string;
  module: moduleTypes; // moduleTypes
  activity_name: string;
  activity_code: string; // activityCode
  activity_method: apiMethods; // apiMethods
  access_params: IAccessParams;
  search_params: ISearchParams[];
  control_params: IControlParams[];
  payload_params: inputParams<T>[];
  form_params: IFormField<T>[];
  required_authentication: boolean;
  admin_access: boolean;
  user_access: boolean;
  employee_access: boolean;
  access_roles: mongoose.Types.ObjectId[];
  url: string;
  status: boolean;
}
