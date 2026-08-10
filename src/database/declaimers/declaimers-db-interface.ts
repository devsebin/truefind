import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";

export interface IDeclaimer extends CommonServiceFieldsInterface {
    title: string;
    content: string;
}
