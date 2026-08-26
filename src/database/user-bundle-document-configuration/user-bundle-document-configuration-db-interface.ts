import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Document, Types } from "mongoose";
import { ServiceUserDocumentConfigurationStatus } from "../service-user-document-configuration/service-user-document-configuration-db-interface";

export interface IServiceBundleUserDocumentUpload {
    document_id: Types.ObjectId;
    uploaded_at?: Date;
    verified_by?: Types.ObjectId;
    verified_at?: Date;
    status: ServiceUserDocumentConfigurationStatus;
    validation_notes?: string;
}

export interface IUserBundleDocumentConfiguration
    extends CommonServiceFieldsInterface,
        Document {
    user_id: Types.ObjectId;
    user_bundle_id: Types.ObjectId;
    bundle_id: Types.ObjectId;
    document_requirement_id: Types.ObjectId;
    is_mandatory: boolean;
    source_service_ids: Types.ObjectId[];
    uploads: IServiceBundleUserDocumentUpload[];
    current_status?: ServiceUserDocumentConfigurationStatus;
    verified_by?: Types.ObjectId;
    verified_at?: Date;
}
