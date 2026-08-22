import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";

export type ServiceUserDocumentConfigurationStatus = "PENDING" | "APPROVED" | "REJECTED" | "HOLD" | "pending" | "approved" | "rejected" | "hold";

export interface IServiceUserDocumentUploads {
    document_id: Types.ObjectId;
    uploaded_at?: Date;
    verified_by?: Types.ObjectId;
    verified_at?: Date;
    status: ServiceUserDocumentConfigurationStatus;
    validation_notes?: string;
}

export interface IServiceUserDocumentConfiguration extends CommonServiceFieldsInterface {
    _id?: Types.ObjectId;
    user_id: Types.ObjectId;
    task_id: Types.ObjectId;
    document_requirement_id: Types.ObjectId;
    is_mandatory: boolean;
    uploads: IServiceUserDocumentUploads[];
    current_status?: ServiceUserDocumentConfigurationStatus;
    verified_by?: Types.ObjectId;
    verified_at?: Date;
    created_at?: Date;
    updated_at?: Date;
}