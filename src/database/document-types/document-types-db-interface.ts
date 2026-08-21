import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";

export interface IDocumentType extends CommonServiceFieldsInterface {
    title: string;
    label: string;
    color: string;
    is_default?: boolean;
}

export interface IDocumentTypeDocument extends IDocumentType, Document { }

export default IDocumentType;