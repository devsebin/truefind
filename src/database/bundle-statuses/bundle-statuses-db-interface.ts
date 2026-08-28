import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";

export interface IBundleStatus extends CommonServiceFieldsInterface {
    title: string;
    label: string;
    description?: string;
    color: string;
    is_default?: boolean;
} 