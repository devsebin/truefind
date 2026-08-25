import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";

export interface IServiceStatus extends CommonServiceFieldsInterface {
    title: string;
    label: string;
    color: string;
    is_default: boolean
}
