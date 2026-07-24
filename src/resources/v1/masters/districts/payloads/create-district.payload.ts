import IDistrict from "@/database/districts/districts-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

export interface IInputDistrictPayload extends Partial<IDistrict> { }

export interface IInputDistrictPayloadStrict extends Strict<
  Partial<IDistrict> & Required<Pick<IDistrict, "name" | "code" | "country_id" | "region_id">>
> { }

export interface IUpdateDistrictPayloadStrict extends Strict<
  Partial<IDistrict> & Required<Pick<IDistrict, "name" | "code" | "country_id" | "region_id">>
> { }
