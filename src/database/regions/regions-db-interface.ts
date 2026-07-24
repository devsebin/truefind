import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";

export interface IRegion extends CommonServiceFieldsInterface {
    name: string; // Name of the region
    code: string; // Short code for the region
    country_id: Types.ObjectId; // Link to country (mandatory)
}

export interface IRegionDocument extends IRegion, Document { }

export default IRegion;
