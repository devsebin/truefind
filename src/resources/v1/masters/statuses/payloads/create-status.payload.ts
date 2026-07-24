import { IStatus } from "@/database/status/status-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

/**
 * Base payload (all fields optional, strictly from IUser)
 */
export interface IInputUserPayload extends Partial<IStatus> {}

/**
 * Strict payload
 * - only IUser keys allowed
 * - required business fields enforced
 */
export interface IInputStatusPayloadStrict extends Strict<
  Partial<IStatus> & Required<Pick<IStatus, "title" | "label" | "color">>
> {}

export interface IUpdateStatusPayloadStrict extends Strict<
  Partial<IStatus> & Required<Pick<IStatus, "title" | "label" | "color">>
> {}
