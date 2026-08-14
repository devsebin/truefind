import { IInputDistrictPayloadStrict } from "../payloads/create-district.payload";
import mongoose from "mongoose";

export interface IDistrictDTO {
  name: string;
  code: string;
  country_id: mongoose.Types.ObjectId;
  region_id: mongoose.Types.ObjectId;
}

export function toDistrictDTO(body: IInputDistrictPayloadStrict): IDistrictDTO {
  return {
    name: body.name.charAt(0).toUpperCase() + body.name.slice(1).toLowerCase().trim(),
    code: body.code.trim().toUpperCase(),
    country_id: new mongoose.Types.ObjectId(body.country_id),
    region_id: new mongoose.Types.ObjectId(body.region_id),
  };
}
