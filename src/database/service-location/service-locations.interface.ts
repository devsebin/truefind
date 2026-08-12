import { Document, Types } from "mongoose";

export interface IServiceLocations extends Document {
  service_id: Types.ObjectId;
  suburb_id: Types.ObjectId;
  is_active: boolean;
  is_deleted: boolean;
}
