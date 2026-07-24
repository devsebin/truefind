export interface IExecutedBy {
  user_id: string;
  first_name?: string;
  last_name?: string;
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
  user_region_code?: string;
  user_country_code?: string;
  user_latitude?: number;
  user_longitude?: number;
  user_postal_code?: string;
  user_isp?: string;
  user_org?: string;
  user_as?: string;
}

export interface FieldChange {
  field_name: string;
  field_old_value: any;
  field_new_value: any;
}

export interface IDbTransaction {
  transaction_id: string;
  operation: string;
  table: string;
  details?: any;
  field_changes: FieldChange[];
}

export interface IBasicInfo {
  requestId: string;
  requestTime?: Date;
  requestDuration: number;
  requestSize: string;
  responseSize: string;
  responseDuration: number;
  responseTime: Date;
  responseCode: number;
  responseMessage: string;
}

export interface IAdditionalInfo {
  basic_info: IBasicInfo;
}

export interface IActivityLog {
  event_type: string;
  module_name: string;
  api_endpoint: string;
  http_method: string;
  user_id?: string | null;
  timestamp: Date;
  client_ip: string;
  client_proxy: string;
  client_user_agent: string;
  response_status: number;
  response_time: String;
  duration_ms: number;
  response_size: string;
  error_details?: any;
  request_headers: any;
  request_params: Record<string, string>;
  request_body: Record<string, any>;
  response_body: Record<string, any>;
  executed_by: IExecutedBy;
  db_transactions: IDbTransaction[];
  additional_info: IAdditionalInfo;
}
