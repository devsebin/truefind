import mongoose, { Schema } from "mongoose";
import { IServiceAreaConfigurationDocument } from "./service-area-configuration.interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { timeUnits } from "../services/services-db-interface";

const serviceAreaConfigurationSchema = new Schema<IServiceAreaConfigurationDocument>(
  {
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Services,
      required: true,
      index: true
    },
    suburb_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Suburbs,
      required: true,
      index: true
    },
    required_licenses: {
      type: Boolean,
      required: false,
    },
    is_callout_service: {
      type: Boolean,
      required: false,
    },
    is_fixed_price: {
      type: Boolean,
      required: false,
    },
    price: {
      type: Number,
      required: false,
    },
    unit_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Units,
      required: false,
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
    ...CommonServiceFieldsModel
  },
  { timestamps: true }
);

serviceAreaConfigurationSchema.index(
  { service_id: 1, suburb_id: 1 },
  { unique: true }
);

serviceAreaConfigurationSchema.plugin(defaultStatusPlugin);
serviceAreaConfigurationSchema.plugin(auditPlugin);

serviceAreaConfigurationSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
  if (!this.getFilter().hasOwnProperty("is_deleted")) {
    this.where({ is_deleted: false });
  }
});

const ServiceAreaConfigurationModel = mongoose.model<IServiceAreaConfigurationDocument>(
  "ServiceAreaConfiguration",
  serviceAreaConfigurationSchema,
  tableName.ServiceAreaConfigurations
);

export default ServiceAreaConfigurationModel;
