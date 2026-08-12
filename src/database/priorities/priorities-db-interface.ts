import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Document } from "mongoose";

export interface IStatus extends CommonServiceFieldsInterface {
    title: string;
    label: string;
    color: string;
    is_default?: boolean;
}

export interface IPrioritiesDocument extends IStatus, Document { }

export default IStatus;