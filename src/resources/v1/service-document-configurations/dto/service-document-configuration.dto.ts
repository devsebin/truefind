import { IRequiredDocument, IServiceDocumentConfiguration } from "@/database/service-document-configuration/service-document-configuration-db-interface";
import { Types } from "mongoose";

export interface ServiceDocumentConfigurationDTO {
  service_id: Types.ObjectId;
  required_documents: {
    document_id: Types.ObjectId;
    is_mandatory: boolean;
    exemption_documents: {
      document_id: Types.ObjectId;
      condition: "valid" | "uploaded";
    }[];
  }[];
}

export function toServiceDocumentConfigurationDTO(body: any): ServiceDocumentConfigurationDTO {
  return {
    service_id: new Types.ObjectId(body.service_id),
    required_documents: (body.required_documents || []).map((doc: any) => ({
      document_id: new Types.ObjectId(doc.document_id),
      is_mandatory: doc.is_mandatory !== undefined ? Boolean(doc.is_mandatory) : true,
      exemption_documents: (doc.exemption_documents || []).map((ex: any) => ({
        document_id: new Types.ObjectId(ex.document_id),
        condition: ex.condition || "valid",
      })),
    })),
  };
}

export function toUpdateServiceDocumentConfigurationDTO(body: any): {
  required_documents: {
    document_id: Types.ObjectId;
    is_mandatory: boolean;
    exemption_documents: {
      document_id: Types.ObjectId;
      condition: "valid" | "uploaded";
    }[];
  }[];
} {
  return {
    required_documents: (body.required_documents || []).map((doc: any) => ({
      document_id: new Types.ObjectId(doc.document_id),
      is_mandatory: doc.is_mandatory !== undefined ? Boolean(doc.is_mandatory) : true,
      exemption_documents: (doc.exemption_documents || []).map((ex: any) => ({
        document_id: new Types.ObjectId(ex.document_id),
        condition: ex.condition || "valid",
      })),
    })),
  };
}
