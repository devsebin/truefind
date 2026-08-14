import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { Document, Types } from "mongoose";

export enum timeUnits {
    minutes = "minutes",
    hours = "hours",
    days = "days",
    weeks = "weeks",
    months = "months",
    years = "years",
}

export interface IBaseServiceDocument
    extends CommonServiceFieldsInterface, Document {
    name: string;
    type: string;
    description: string;
    is_active: boolean;
    is_deleted: boolean;
    icon: Types.ObjectId;
    children: IBaseServiceDocument[];
}

export interface ICategoryDocument extends IBaseServiceDocument { }
export interface ISubcategoryDocument extends IBaseServiceDocument { }
export interface ITaskServiceDocument extends IBaseServiceDocument {
    name: string;
    type: typeof serviceTypes.Service;
    description: string;
    icon: Types.ObjectId;
    estimated_time: number;
    estimated_time_unit: timeUnits;
}
