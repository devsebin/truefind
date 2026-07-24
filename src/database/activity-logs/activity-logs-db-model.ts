import mongoose, { Schema, model } from "mongoose";
import {
  IActivityLog,
  IAdditionalInfo,
  IBasicInfo,
  IDbTransaction,
  FieldChange,
  IExecutedBy,
} from "@/database/activity-logs/activity-logs-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";

const ExecutedBySchema = new Schema<IExecutedBy>({
  user_id: { type: String, required: true },
  first_name: { type: String, required: false, default: null },
  last_name: { type: String, required: false, default: null },
  user_email: { type: String, required: true },
  user_role: { type: String, required: true },
  user_timezone: { type: String, required: true },
  user_ip: { type: String, required: true },
  user_proxy: { type: String, required: false, default: null },
  user_agent: { type: String, required: true },
  user_device: { type: String, required: true },
  user_os: { type: String, required: true },
  user_browser: { type: String, required: true },
  user_location: { type: String, required: true },
  user_country: { type: String, required: true },
  user_region: { type: String, default: null },
  user_city: { type: String, default: null },
  user_time: { type: Date, required: true },
});

const FieldChangeSchema = new Schema<FieldChange>(
  {
    field_name: { type: String, required: true },
    field_old_value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    field_new_value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false },
);

const DbTransactionSchema = new Schema<IDbTransaction>({
  transaction_id: { type: String, required: true },
  operation: { type: String, required: true },
  table: { type: String, required: true },
  details: { type: Schema.Types.Mixed, default: null },
  field_changes: { type: [FieldChangeSchema], required: true },
});

const BasicInfoSchema = new Schema<IBasicInfo>(
  {
    requestId: { type: String, required: true },
    requestTime: { type: Date, default: null },
    requestDuration: { type: Number, required: true },
    requestSize: { type: String, required: true },
    responseSize: { type: String, required: true },
    responseDuration: { type: Number, required: true },
    responseTime: { type: Date, required: true },
    responseCode: { type: Number, required: true },
    responseMessage: { type: String, required: true },
  },
  { _id: false },
);

const AdditionalInfoSchema = new Schema<IAdditionalInfo>({
  basic_info: { type: BasicInfoSchema, required: true },
});

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    event_type: { type: String, required: true },
    module_name: { type: String, required: true },
    api_endpoint: { type: String, required: true },
    http_method: { type: String, required: true },
    user_id: { type: String, default: null },
    timestamp: { type: Date, required: true },
    client_ip: { type: String, required: true },
    client_proxy: { type: String, required: false, default: null },
    client_user_agent: { type: String, required: true },
    response_status: { type: Number, required: true },
    response_time: { type: Date, required: true },
    duration_ms: { type: Number, required: true },
    response_size: { type: String, required: true },
    error_details: { type: Schema.Types.Mixed, default: null },
    request_headers: {
      type: Map,
      of: String,
      required: true,
    },
    request_params: {
      type: Map,
      of: String,
      required: true,
    },
    request_body: {
      type: Schema.Types.Mixed,
      required: true,
    },
    response_body: {
      type: Schema.Types.Mixed,
      required: true,
    },
    executed_by: { type: ExecutedBySchema, required: true },
    db_transactions: {
      type: [DbTransactionSchema],
      required: true,
      default: [],
    },
    additional_info: { type: AdditionalInfoSchema, required: true },
  },
  { timestamps: true },
);

// Export model
const ActivityLogModel = model<IActivityLog>(
  tableName.ActivityLog,
  ActivityLogSchema,
);
export default ActivityLogModel;
