import mongoose, { Schema } from "mongoose";
import { IServiceCountryConfigurationDocument } from "./service-country-configuration.interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { timeUnits } from "../services/services-db-interface";

const serviceCountryConfigurationSchema = new Schema<IServiceCountryConfigurationDocument>(
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
      index: true
    },
    required_licenses: {
      type: Boolean,
      required: true,
      default: false,
    },
    is_callout_service: {
      type: Boolean,
      required: true,
      default: false,
    },
    is_fixed_price: {
      type: Boolean,
      required: true,
      default: false,
    },
    currency_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Currencies,
      required: true,
    },
    price: {
      type: Number,
      required: false,
    },
    unit_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Units,
      required: true,
    },
    minimum_unit_price: {
      type: Number,
      required: false,
    },
    maximum_unit_price: {
      type: Number,
      required: false,
    },
    call_out_fee: {
      type: Number,
      required: false,
    },
    estimated_time: {
      type: Number,
      required: false,
    },
    estimated_time_unit: {
      type: String,
      enum: timeUnits,
      required: false,
    },
    status_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Status,
    },
    ...CommonServiceFieldsModel
  },
  { timestamps: true }
);

serviceCountryConfigurationSchema.index(
  { service_id: 1, country_id: 1 },
  { unique: true }
);

serviceCountryConfigurationSchema.index(
  { country_id: 1, is_active: 1 }
);

serviceCountryConfigurationSchema.plugin(defaultStatusPlugin);
serviceCountryConfigurationSchema.plugin(auditPlugin);

serviceCountryConfigurationSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
  if (!this.getFilter().hasOwnProperty("is_deleted")) {
    this.where({ is_deleted: false });
  }
});

const ServiceCountryConfigurationModel = mongoose.model<IServiceCountryConfigurationDocument>(
  "ServiceCountryConfiguration",
  serviceCountryConfigurationSchema,
  tableName.ServiceCountryConfigurations
);

export default ServiceCountryConfigurationModel;
