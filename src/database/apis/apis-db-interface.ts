import { datatypes } from "@/utils/definitions/constants/data-types";
import { roleTypes } from "@/utils/definitions/constants/role-types";
import { searchTypes } from "@/utils/definitions/constants/search-types";
import { FormFieldType, IAccessParams } from "@/utils/interfaces/api.interface";
import mongoose, { Document } from "mongoose";


interface Authentication {
  admin: boolean;
  user: boolean;
  employee: boolean;
}

export interface ISearchParams {
  title: string;
  value: string;
  allowed_values: string[];
  datatype: datatypes;
  search_type: searchTypes;
  is_active: boolean;
  is_required: boolean;
  admin_access?: boolean;
  user_access?: boolean;
  employee_access?: boolean;
}

export interface IControlParams {
  key: string;
  type: datatypes;
  allowed_values: string[];
  datatype: datatypes;
  is_active: boolean;
  admin_access: boolean;
  user_access: boolean;
  employee_access: boolean;
}

interface InputParams {
  key: string;
  value: string;
  type: string;
  required: boolean;
  parent: boolean;
  parent_key: string;
}

export interface IDataSource {
  api: string;
  method?: "GET" | "POST";
  label_key: string;
  value_key: string;
}

export interface IFormOption {
  label: string;
  value: any;
}

export interface IFormParams extends Document {
  key: string;
  label: string;
  field_type: FormFieldType;
  datatype: datatypes;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  multiple?: boolean;
  default_value?: any;
  options?: IFormOption[];
  data_source?: IDataSource;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;

    pattern?: string;
  };
  ui?: {
    rows?: number;
    grid?: number;
  };
}

export interface IApi extends Document {
  activity_type: string;
  module: roleTypes;
  activity_name: string;
  activity_method: string;
  activity_code: string;
  url: string;
  access_params: IAccessParams;
  search_params: ISearchParams[];
  payload_params: InputParams[];
  form_params: IFormParams[];
  access_roles: mongoose.Types.ObjectId[];
  status: boolean;
  authentication: Authentication;
  required_authentication: boolean;
}
