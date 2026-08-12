import mongoose, { Schema } from "mongoose";
import { tableName } from "@/utils/definitions/constants/table-names";
import { IServiceLocations } from "./service-locations.interface";

const ServiceLocationSchema = new Schema<IServiceLocations>(
  {
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Services,
      required: true,
    },
    suburb_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Suburbs,
      required: true,
    },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ServiceLocationModel = mongoose.model<IServiceLocations>(
  tableName.ServiceLocations,
  ServiceLocationSchema
);
