import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";

export interface IBundleLocationConfigStatus extends CommonServiceFieldsInterface {
    title: string;
    label: string;
    color: string;
    is_default?: boolean;
}