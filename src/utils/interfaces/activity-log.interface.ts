import { operatorTypes } from "../definitions/constants/operator-types";

export interface ExecutedBy {
  user_name: string;
  user_email: string;
  user_role: string;
  user_timezone: string;
  user_ip: string;
  user_proxy: string;
  user_agent: string;
  user_device: string;
  user_os: string;
  user_browser: string;
  user_location: string;
  user_country: string;
  user_region?: string;
  user_city?: string;
  user_time: Date;
}

export interface additionalBasicInfo {
  requestId: string;
  requestTime: Date;
  requestDuration: number;
  requestSize: string;
  responseSize: string;
  responseDuration: number;
  responseTime: string;
  responseCode: number;
  responseMessage: string;
}

export interface AdditionalInfo {
  basic_info: additionalBasicInfo;
}

interface conditions {
  field: string;
  operator: operatorTypes;
  value: string;
}

export interface FieldChange {
  field_name: string;
  field_old_value: any;
  field_new_value: any;
}

export interface DbTransaction {
  transaction_id: string;
  method: string;
  operation: string;
  table: string;
  details: {
    conditions: conditions[];
    query: string;
    data: any;
  };
  field_changes: FieldChange[];
}

export interface ActivityLogModule {
  module_name: string;
  activity_type: string;
  api_method: string;
  api_endpoint: string;
  http_method: string;
  timestamp: Date;
  client_ip: string;
  client_proxy: string;
  client_user_agent: string;
  response_status: number;
  response_time: Date;
  duration_ms: number;
  error_details?: any;
  request_headers?: any;
  request_params?: any;
  request_body?: any;
  response_body: any;
  executed_by: ExecutedBy;
  db_transactions: [];
  additional_info: AdditionalInfo;
}
