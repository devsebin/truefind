import { Strict } from "@/utils/helpers/query-filter";

export interface IInputSuburbPayload {
  name: string;
  code: string;
  country_id: string;
  region_id: string;
  district_id: string;
  post_code: string;
  latitude: number;
  longitude: number;
}

export interface IInputSuburbPayloadStrict extends Strict<IInputSuburbPayload> { }

export interface IUpdateSuburbPayloadStrict extends Strict<Partial<IInputSuburbPayload>> { }
