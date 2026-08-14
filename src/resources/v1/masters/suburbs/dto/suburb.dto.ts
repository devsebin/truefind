import { IInputSuburbPayloadStrict } from "../payloads/create-suburb.payload";
import mongoose from "mongoose";

export interface ISuburbDTO {
  name: string;
  code: string;
  country_id: mongoose.Types.ObjectId;
  region_id: mongoose.Types.ObjectId;
  district_id: mongoose.Types.ObjectId;
  post_code: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export function toSuburbDTO(body: IInputSuburbPayloadStrict): ISuburbDTO {
  return {
    name: body.name.charAt(0).toUpperCase() + body.name.slice(1).toLowerCase().trim(),
    code: body.code.trim().toUpperCase(),
    country_id: new mongoose.Types.ObjectId(body.country_id),
    region_id: new mongoose.Types.ObjectId(body.region_id),
    district_id: new mongoose.Types.ObjectId(body.district_id),
    post_code: body.post_code ? body.post_code.trim() : "",
    location: {
      type: "Point",
      coordinates: [Number(body.longitude), Number(body.latitude)],
    },
  };
}

export function toUpdateSuburbDTO(body: Partial<IInputSuburbPayloadStrict>): Partial<ISuburbDTO> {
  const dto: any = {};
  if (body.name !== undefined) dto.name = body.name.trim();
  if (body.code !== undefined) dto.code = body.code.trim().toUpperCase();
  if (body.country_id !== undefined) dto.country_id = new mongoose.Types.ObjectId(body.country_id);
  if (body.region_id !== undefined) dto.region_id = new mongoose.Types.ObjectId(body.region_id);
  if (body.district_id !== undefined) dto.district_id = new mongoose.Types.ObjectId(body.district_id);
  if (body.post_code !== undefined) dto.post_code = body.post_code ? body.post_code.trim() : "";
  if (body.longitude !== undefined && body.latitude !== undefined) {
    dto.location = {
      type: "Point",
      coordinates: [Number(body.longitude), Number(body.latitude)],
    };
  }
  return dto;
}
