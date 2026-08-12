import IStatus from "@/database/priorities/priorities-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

export interface IInputPrioritiesPayload extends Partial<IStatus> { }

export interface IInputIPrioritiesPayloadStrict extends Strict<
  Partial<IStatus> &
  Required<
    Pick<
      IStatus,
      | "title"
      | "label"
      | "color"
    >
  >
> { }
