import { IInputICountryPayloadStrict } from "../payloads/country-payload";
import { capitalize } from "@/utils/helpers/capitalize-string.helper";
import { Types } from "mongoose";

export interface ICountryDTO {
    name: string;
    iso_code: string;
    iso_code_3: string;
    phone_code: string;
    currency: string;
    continent: string;
    timezone: string[];
    flags?: Types.ObjectId;
}
export function toCountryDTO(body: IInputICountryPayloadStrict): ICountryDTO {
    return {
        name: capitalize(body.name),
        iso_code: capitalize(body.iso_code),
        iso_code_3: capitalize(body.iso_code_3),
        phone_code: body.phone_code,
        currency: body.currency,
        continent: body.continent,
        timezone: body.timezone,
        flags: body.flags,
    };
}
