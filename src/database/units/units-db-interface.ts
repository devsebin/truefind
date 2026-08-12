import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Document } from "mongoose";

export interface IUnits extends CommonServiceFieldsInterface {
    title: string;
    label: string;
    color: string;
    dimension: string;
    is_default?: boolean;
}

export interface IUnitsDocument extends IUnits, Document { }

export default IUnits;