import { IRegion } from "@/database/regions/regions-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

export interface IInputRegionPayload extends Partial<IRegion> { }

export interface IInputRegionPayloadStrict extends Strict<
  Partial<IRegion> & Required<Pick<IRegion, "name" | "code" | "country_id">>
> { }

export interface IUpdateRegionPayloadStrict extends Strict<
  Partial<IRegion> & Required<Pick<IRegion, "name" | "code" | "country_id">>
> { }
