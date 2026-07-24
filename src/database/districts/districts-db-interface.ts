import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";

interface IDistrict extends CommonServiceFieldsInterface {
    name: string;
    code: string;
    country_id: Types.ObjectId;
    region_id: Types.ObjectId;
    suburb_ids?: Types.ObjectId[];
}

export default IDistrict;