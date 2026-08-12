import { Document, Types } from "mongoose";

export interface IServiceLocations extends Document {
  service_id: Types.ObjectId;
  country_id: Types.ObjectId;
  region_id: Types.ObjectId;
  district_id: Types.ObjectId;
  is_active: boolean;
  is_deleted: boolean;
}
