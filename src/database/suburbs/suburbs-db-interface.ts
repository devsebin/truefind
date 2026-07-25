import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";

interface ISuburb extends CommonServiceFieldsInterface {
    name: string;
    code: string;
    country_id: Types.ObjectId;
    region_id: Types.ObjectId;
    district_id: Types.ObjectId;
    post_code: string;
    location: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
    };
}

export default ISuburb;
