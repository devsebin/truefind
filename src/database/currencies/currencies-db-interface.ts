import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";

export interface ICurrency extends CommonServiceFieldsInterface {
    title: string;
    label: string;
    code: string;
    symbol: Types.ObjectId;
}