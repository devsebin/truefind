import { IInputServiceDocumentPayloadStrict } from "../payloads/service-document-payload";
import { IDocumentDataRequirement } from "@/database/service-documents/service-documents-db-interface";
import { Types } from "mongoose";

export interface IServiceDocumentDTO {
    name: string;
    display_name: string;
    item_code: string;
    document_type_id: Types.ObjectId;
    description?: string;
    max_file_size: number;
    accepted_mimeTypes: string[];
    samples?: Types.ObjectId[] | null;
    data_requirements?: IDocumentDataRequirement[];
    status_id?: Types.ObjectId;
}

export function toServiceDocumentDTO(body: IInputServiceDocumentPayloadStrict): IServiceDocumentDTO {
    return {
        name: body.name.trim(),
        display_name: body.display_name.trim(),
        item_code: body.item_code.trim(),
        document_type_id: new Types.ObjectId(body.document_type_id),
        description: body.description ?? "",
        max_file_size: body.max_file_size,
        accepted_mimeTypes: body.accepted_mimeTypes,
        samples: body.samples ? body.samples.map(s => new Types.ObjectId(s)) : [],
        data_requirements: body.data_requirements ?? [],
        ...(body.status_id ? { status_id: new Types.ObjectId(body.status_id) } : {}),
    };
}
