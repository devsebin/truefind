import mongoose, { Schema } from "mongoose";
import { IServiceLocations } from "./service-locations.interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { timeUnits } from "../services/services-db-interface";

const serviceLocationSchema = new Schema<IServiceLocations>(
  {
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Services,
      required: true,
      index: true
    },
    country_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Countries,
      required: true,
    },
    region_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Regions,
      required: true,
    },
    district_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Districts,
      required: true,
      index: true
    },
    requiredLicenses: {
      type: Boolean,
      default: false,
    },
    estimated_time: {
      type: Number,
      required: false,
      default: 0,
    },
    estimated_time_unit: {
      type: String,
      enum: timeUnits,
      required: false,
      default: timeUnits.hours,
    },
    priority_id: {
      type: Schema.Types.ObjectId,
      ref: tableName.Priority,
      required: false,
      default: null,
    },
    is_fixed_price: {
      type: Boolean,
      default: false,
    },
    task_unit: {
      type: Schema.Types.ObjectId,
      ref: tableName.Units,
      required: false,
      default: null,
    },
    task_unit_price: {
      type: Number,
      required: false,
      default: 0,
    },
    maximum_unit_price: {
      type: Number,
      required: false,
      default: 0,
    },
    minimum_unit_price: {
      type: Number,
      required: false,
      default: 0,
    },
    is_callout_service: {
      type: Boolean,
      default: false,
    },
    ...CommonServiceFieldsModel
  },
  { timestamps: true }
);


serviceLocationSchema.index(
  { service_id: 1, country_id: 1, region_id: 1, district_id: 1 },
  { unique: true },
);

serviceLocationSchema.plugin(defaultStatusPlugin);
serviceLocationSchema.plugin(auditPlugin);


serviceLocationSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
  if (!this.getFilter().hasOwnProperty("is_deleted")) {
    this.where({ is_deleted: false, is_active: true });
  }
});

export const ServiceLocationModel = mongoose.model<IServiceLocations>(
  "ServiceLocation",
  serviceLocationSchema,
  tableName.ServiceLocations
);
