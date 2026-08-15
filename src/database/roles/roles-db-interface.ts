import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Document } from "mongoose";

export interface IRole extends CommonServiceFieldsInterface {
    title: string;
    label: string;
    color: string;
    is_default: boolean;
}

export interface IRoleDocument extends IRole, Document { }

export default IRole;