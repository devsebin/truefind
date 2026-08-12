import IUnits from "@/database/units/units-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

export interface IInputUnitsPayload extends Partial<IUnits> { }

export interface IInputIUnitsPayloadStrict extends Strict<
  Partial<IUnits> &
  Required<
    Pick<
      IUnits,
      | "title"
      | "label"
      | "dimension"
      | "color"
    >
  >
> { }
