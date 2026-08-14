import { IInputRegionPayloadStrict } from "../payloads/create-region.payload";
import mongoose from "mongoose";

export interface IRegionDTO {
  name: string;
  code: string;
  country_id: mongoose.Types.ObjectId;
}

export function toRegionDTO(body: IInputRegionPayloadStrict): IRegionDTO {
  return {
    name: body.name.charAt(0).toUpperCase() + body.name.slice(1).toLowerCase().trim(),
    code: body.code.trim().toUpperCase(),
    country_id: new mongoose.Types.ObjectId(body.country_id),
  };
}
