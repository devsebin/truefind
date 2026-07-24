import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";

export interface ICountryProviders {
    provider_id: Types.ObjectId;
    is_default: boolean;
}
interface ICountry extends CommonServiceFieldsInterface {
    name: string; // Name of the country
    iso_code: string; // ISO 3166-1 Alpha-2 code
    iso_code_3: string; // ISO 3166-1 Alpha-3 code
    region_ids?: Types.ObjectId[];
    phone_code: string;
    currency: string;
    continent: string;
    timezone?: string[];
    created_at?: Date;
    updated_at?: Date;
    flags?: Types.ObjectId;
    providers?: [ICountryProviders];
}

export interface ICountryDocument extends ICountry, Document { }

export default ICountry;
