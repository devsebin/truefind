import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";

export interface IBundleUserMappingStatus extends CommonServiceFieldsInterface {
    title: string;
    label: string;
    color: string;
    is_default?: boolean;
}