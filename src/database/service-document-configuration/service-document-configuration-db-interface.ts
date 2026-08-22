import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";

export interface IRequiredDocument extends CommonServiceFieldsInterface {
    document_id: Types.ObjectId; // Ref: TaskDocumentRequirements
    is_mandatory?: boolean; // default true
    exemption_documents?: {
        document_id: Types.ObjectId;
        condition?: "valid" | "uploaded"; // Default to 'uploaded'
    }[];
}
export interface IServiceDocumentConfiguration extends CommonServiceFieldsInterface {
    service_id: Types.ObjectId; // Ref: Services
    required_documents: IRequiredDocument[];
}