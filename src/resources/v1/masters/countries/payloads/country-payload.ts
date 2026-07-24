import ICountry from "@/database/countries/countries-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

/**
 * Base payload (all fields optional, strictly from IUser)
 */
export interface IInputCountryPayload extends Partial<ICountry> { }

/**
 * Strict payload
 * - only IUser keys allowed
 * - required business fields enforced
 */
export interface IInputICountryPayloadStrict extends Strict<
  Partial<ICountry> &
  Required<
    Pick<
      ICountry,
      | "name"
      | "iso_code"
      | "iso_code_3"
      | "phone_code"
      | "currency"
      | "continent"
      | "timezone"
    >
  >
> { }

export interface IUpdateICountryPayloadStrict extends Strict<
  Partial<ICountry> &
  Required<
    Pick<
      ICountry,
      | "name"
      | "iso_code"
      | "iso_code_3"
      | "phone_code"
      | "currency"
      | "continent"
      | "timezone"
    >
  >
> { }
