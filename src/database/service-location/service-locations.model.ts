import mongoose, { Schema } from "mongoose";
import { IServiceLocations } from "./service-locations.interface";
import { tableName } from "@/utils/definitions/constants/table-names";

const serviceLocationSchema = new Schema<IServiceLocations>(
  {
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Services,
      required: true,
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
    },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

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
